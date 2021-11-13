import pathlib
import os
import csv
import numpy
import threading
from oct2py import Oct2Py
from math import ceil
import subprocess
import time

from tomo.models import  Dataset, Mesh

from .FilesManagement import FilesManagement as gf
from .EmailsManagement import EmailsManagement as gc
from celery import shared_task



class DatasetsManagement(object):
    """It contains all the necessary methods for creating, uploading and managing datasets."""

    @staticmethod
    def check_length(meshes_list, longitud):
        """It returns True if all the meshes in the list passed as the first argument have the length specified 
        in the second argument."""

        list_bool = map(lambda x: (len(x) == longitud), meshes_list)
        
        mismas = all(list_bool)
        return mismas




    @staticmethod
    def validate_dataset_file_structure(dataset, meshes_list):
        """It checks that the file has the proper structure if 16 electrodes and an adjacent estimation pattern are used."""

        structure_correcta = False
        n_elec = 16
        p_estim = "adyacente"

        if int(n_elec) == 16 and str(p_estim) == "adyacente":
            structure_correcta = DatasetsManagement.check_length(meshes_list, 208 + 844 + 1)

        return structure_correcta




    @staticmethod
    def initiate_dataset_task(dataset, file = False, tuple_n_meshes = (0,0,0)):
        """It starts an upload or a generation of a dataset. If the parameter 'file' is True, a dataset upload will be started. 
        Otherwise, the generation of a dataset will be initiated. In both cases, it will be used the information contained in the 
        object passed as the first argument of the method."""

        
        if (type(file) != bool):
            username = dataset.creator.get_username()
            direc = gf.build_path_directory("nuevo_dataset{}.csv".format(dataset.id), username)

            with open(direc, 'wb+') as destino:
                destino.write(file.read())

            meshes_list = DatasetsManagement.read_new_dataset(username, dataset)

            if not DatasetsManagement.validate_dataset_file_structure(dataset, meshes_list):
                raise Exception("Estructura del file incorrecta")
            task = DatasetsManagement.insert_dataset.delay(dataset.id,meshes_list)

        else:
            task = DatasetsManagement.generate_dataset.delay(dataset.id,tuple_n_meshes)
            dataset.state = str(task.id)
            dataset.save()
        
    


    @staticmethod
    def filter_rows(meshes_list, n):
        filas = [f for f in meshes_list if f[-1] == n]
        return filas



    @staticmethod
    def read_new_dataset(username, dataset):
        list_completa = []
        direc = gf.build_path_directory("nuevo_dataset{}.csv".format(dataset.id), username)

        with open(direc) as csvfile:
            file = csv.reader(csvfile, delimiter=';')
            for fila in file:
                list_completa.append(fila)
        return list_completa



    @staticmethod
    @shared_task
    def insert_dataset(id_dataset, meshes_list):
        """It performs the task of inserting a dataset into the DB, once the voltages and conductivities have been extracted from 
        the file uploaded by the user. """
        
        dataset = Dataset.objects.get(id = id_dataset)
        inicio = time.time()
        meshes_n1 = DatasetsManagement.filter_rows(meshes_list, "1")
        meshes_n2 = DatasetsManagement.filter_rows(meshes_list, "2")
        meshes_n3 = DatasetsManagement.filter_rows(meshes_list, "3")
        grupos_meshes = [meshes_n1, meshes_n2, meshes_n3]

        dataset.state = str(threading.get_ident())
        dataset.save()
        
        index = 0
        meshes_list_crear = []
        
        for i in range(len(grupos_meshes)): #It will iterate three times
            for m in grupos_meshes[i]:
                mesh = Mesh(index = index, number_artifacts = i+1, dataset = dataset, voltages = m[:208], conductivities = m[208:-1])
                meshes_list_crear.append(mesh)

                index+=1

        Mesh.objects.bulk_create(meshes_list_crear) #Inserting all the meshes in a single access to the BD
        
        dataset.state = "pending"
        username = dataset.creator.get_username()
        nombre_file = "nuevo_dataset{}.csv".format(dataset.id)
        gf.remove_file_individual(username, nombre_file)
        dataset.save()
        fin = time.time()
        



    @staticmethod
    def forward_model_octave(primera_mesh, ultima_mesh, path_dataset, carpeta):
        """It calls Octave methods to calculate the forward-model on the specified files. This method is used by 
        the method calculate_forward_model."""
        
        cadena = '''
        run {};
        primera_mesh_a_procesar = {};
        ultima_mesh_a_procesar = {};

        carpeta = {};

        entrada = strcat('{}meshes/', carpeta, '/');
        output = strcat('{}forwardModel/', carpeta, '/');
        mkdir(output)

        stim = mk_stim_patterns(16,1,'{}','{}',{},1);

        for i=primera_mesh_a_procesar:ultima_mesh_a_procesar
            load([entrada num2str(i) ".out"]);

            img.fwd_model.stimulation = stim;
            img.fwd_solve.get_all_meas = 1;
            vh = fwd_solve(img);
            
            dlmwrite([output num2str(i) ".csv"], vh.meas', ";");
        end
        '''.format(gf.path_eidors(), str(primera_mesh), str(ultima_mesh), str(carpeta), path_dataset, path_dataset,"{ad}","{ad}","{}")

        oct = Oct2Py()
        oct.eval(cadena)

        


    @staticmethod
    def calculate_forward_model(dataset, n1_r, n2_r, n3_r):
        """It calculates the forward-model from the values stored in the files generated by the C++ module."""

        path_dataset = gf.build_path_dir_dataset(dataset, "")
        for i in range(dataset.min_radius, dataset.max_radius + 1):
            DatasetsManagement.forward_model_octave(1, n1_r, path_dataset, "'1obj/" + str(i) + "'")
            
        for i in range(dataset.min_radius, dataset.max_radius + 1):
            DatasetsManagement.forward_model_octave(1, n2_r, path_dataset, "'2obj/" + str(i) + "'")

        for i in range(dataset.min_radius, dataset.max_radius + 1):
            DatasetsManagement.forward_model_octave(1, n3_r, path_dataset, "'3obj/" + str(i) + "'")




    @staticmethod
    def get_n_artifacts_per_radius(n1, n2, n3, nr):
        """It returns how many meshes of 1, 2 and 3 artifacts should be generated for each radius."""

        n1_r = ceil(n1/nr)
        n2_r = ceil(n2/nr)
        n3_r = ceil(n3/nr)	
        return n1_r, n2_r, n3_r



    @staticmethod
    def generate_meshes(dataset, n1_r, n2_r, n3_r):
        """It calls the C++ module to generate the meshes according to the user-defined parameters."""

        dir_path = os.path.dirname(os.path.realpath(__file__))
        f = open(gf.build_path_modC("output.txt"), "w")
        f_errors = open(gf.build_path_modC("errors.txt"), "w")
        main_ejec = gf.build_path_modC("main")

        commands = [main_ejec,  str(n1_r), str(n2_r), str(n3_r), str(dataset.min_radius), str(dataset.max_radius), str(dataset.creator.get_username()), str(dataset.id), str(dataset.seed)]
        subprocess.run(commands,  stdout=f, stderr=f_errors)



        f.close()
        f_errors.close()
        
        


    @staticmethod
    def insert_meshes_generation(dataset, list_voltages, list_conductivities, n1,n2,n3):
        """It inserts in the DB the meshes generated in a dataset generation task."""
        
        ln = [n1,n2,n3]
        
        meshes_list_crear = []

        for i in range(len(ln)):
            for j in range(ln[i]):
                index = sum(ln[:i]) + j
                mesh = Mesh(index = index, number_artifacts = i+1, dataset = dataset, voltages = list_voltages[index],
                            conductivities = list_conductivities[index])
                meshes_list_crear.append(mesh)
                
        Mesh.objects.bulk_create(meshes_list_crear) #Inserting all the meshes in a single access to the BD





    @staticmethod
    @shared_task
    def generate_dataset(id_dataset, tuple_n_meshes): #I use id_dataset instead of a dataset object, because we need something serializable with Celery.
        """It calls all the methods defined above to generate a dataset and insert it into the DB."""
        
        dataset = Dataset.objects.get(id = id_dataset)
        
        gf.create_temporal_dataset_dir(id_dataset)
        n1 = tuple_n_meshes[0]
        n2 = tuple_n_meshes[1]
        n3 = tuple_n_meshes[2]
        
        nr = dataset.max_radius - dataset.min_radius + 1 #Number of different radii
        n1_r, n2_r, n3_r = DatasetsManagement.get_n_artifacts_per_radius(n1, n2, n3, nr)
        
        DatasetsManagement.generate_meshes(dataset, n1_r, n2_r, n3_r)
        
        DatasetsManagement.calculate_forward_model(dataset, n1_r,n2_r,n3_r)
        
        s1 = n1_r*nr - n1 #Number of surplus meshes with 1 artifact
        s2 = n2_r*nr - n2
        s3 = n3_r*nr - n3
        
        gf.remove_surplus_meshes(dataset, s1,s2,s3)
        list_voltages,list_conductivities = gf.read_voltages_conductivities(dataset)
        DatasetsManagement.insert_meshes_generation(dataset, list_voltages, list_conductivities, n1 ,n2 ,n3)

        dataset.state = "pending"
        dataset.save()
        
        gf.remove_dataset_directory(dataset.creator.get_username(), dataset.id)
        gc.send_email_dataset(dataset, dataset.creator.email)
        

        


    
