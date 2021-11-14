from .ModelsManagement import ModelsManagement as gm
from .FilesManagement import FilesManagement as gf
from .DataProcessing import Processing as pro


from tomo.models import  Model, Dataset, Mesh


import numpy
from oct2py import octave
import pathlib
import random
import time

class RecImg(object):

    @staticmethod
    def predict_conductivity(voltages, id_model, username):
        """It predicts conductivities from a list of voltages and returns a list of conductivities."""

        loaded_model = gm.load_model(id_model, username)
        linea1_voltages = [float(v) for v in voltages]

        prediccion = loaded_model.predict(numpy.array([linea1_voltages]))
        prediccion = prediccion.tolist()

        return prediccion
  


    @staticmethod
    def predict_conductivity_loaded_model(voltages, model_loaddo):
        """It predicts conductivities using the already loaded model passed as second parameter. 
        It returns a list of conductivities."""

        linea1_voltages = [float(v) for v in voltages]
        prediccion = model_loaddo.predict(numpy.array([linea1_voltages]))
        prediccion = prediccion.tolist()

        return prediccion



    @staticmethod
    def predict_conductivities(id_model, file, username):
        """It predicts conductivities from voltages in a voltage file."""

        list_voltages = gf.read_set_voltages(file, username)
        model = Model.objects.get(id = id_model)

        if not gf.validate_structure_file_voltages(list_voltages):
            raise Exception("Estructura del file incorrecta")

        model_loaddo = gm.load_model(id_model, username)
        predicted_conductivities = model_loaddo.predict(list_voltages)
        
        return list_voltages, predicted_conductivities
        


    @staticmethod
    def modify_meshes(conductivities_reales, predicted_conductivities, username):
        """With the values of the actual and predicted conductivities passed as the first and second parameter, 
        the base file used to represent meshes is modified."""

        template = RecImg.read_mesh_template()
        RecImg.modify_mesh_individual_real(template, conductivities_reales, username, 1)
        RecImg.modify_mesh_individual(template, predicted_conductivities, username, 2)



    @staticmethod
    def read_mesh_template():
        """Reads the .out template file for the meshes."""

        data = []
        with open(gf.build_path('mesh.out'), 'r') as file:
            data = file.readlines()

        return data[:]


    @staticmethod
    def modify_mesh_individual(template, conductivities, username, n_mesh, es_numpy = True):
        """It modifies the .out file of a single mesh."""

        if es_numpy:
            conductivities = [str(e) + "\n" for e in conductivities[0]]
        else:
            conductivities = [str(e) + "\n" for e in conductivities]

        template[4687:5531] = conductivities
        mesh = "mesh{}.out".format(n_mesh)
        with open(gf.build_path_directory(mesh, username), 'w') as file:
            file.writelines(template)
    


    @staticmethod
    def modify_mesh_individual_real(template, conductivities, username, n_mesh):
        """It modifies the .out file of a single mesh. This method is used when the user reconstructs the image of 
        a mesh whose real representation is unknown."""

        conductivities = [str(e) + "\n" for e in conductivities]
        template[4687:5531] = conductivities
        mesh = "mesh{}.out".format(n_mesh)
        with open(gf.build_path_directory(mesh, username), 'w') as file:
            file.writelines(template)



    @staticmethod
    def get_octave_string(username, n_mesh, load_eidors = True):
        """It returns a string with the octave code needed to represent the image of a mesh."""

        marca = int(round(time.time() * 1000))

        mesh_out = gf.build_path_directory("mesh{}.out".format(n_mesh), username)
        mesh_png = gf.build_path_images("mesh{}_{}_{}.png".format(n_mesh, username, marca))
        
        if load_eidors == True:
            eidors = "run {}".format(gf.path_eidors())
        else:
            eidors = ""

        cadena ='''
        {}
        graphics_toolkit gnuplot

        load {} img
        img.calc_colours.ref_level= 1;
        img.calc_colours.clim=100;
        figuraFantasma = figure("Visible",false)
        show_fem(img)
        a=eidors_colourbar(img);

        print -dpng {}
        '''.format(eidors, mesh_out, mesh_png)

        return cadena, marca



    @staticmethod
    def reconstruct_img(id_mesh_selectionada, id_model, username, postprocessing_flag = True):
        """It reconstructs the actual image of a mesh and the image from the predictions made by a model."""

        voltages = Mesh.objects.get(id = id_mesh_selectionada).voltages
        conductivities_reales = Mesh.objects.get(id = id_mesh_selectionada).conductivities
        predicted_conductivities = RecImg.predict_conductivity(voltages, id_model, username)

        if(postprocessing_flag):
            
            threshold = Model.objects.get(id = id_model).postprocessing_threshold
            predicted_conductivities = pro.postprocessing_individual(predicted_conductivities, threshold)
        RecImg.modify_meshes(conductivities_reales,predicted_conductivities, username)
        cadena1, marca1 = RecImg.get_octave_string(username, 1)
        cadena2, marca2 = RecImg.get_octave_string(username, 2, load_eidors = False)

        octave.addpath(str(pathlib.Path(__file__).parent.absolute()))
        octave.eval(cadena1)
        octave.eval(cadena2)
        return predicted_conductivities[0], (marca1, marca2) #Devuelve una list contenida en una list



    @staticmethod
    def reconstruct_img_single(predicted_conductivities, id_model, username, postprocessing_flag = True):
        """It reconstructs the image from the conductivities passed as the first parameter of the method."""

        if(postprocessing_flag):
            threshold = Model.objects.get(id = id_model).postprocessing_threshold
            predicted_conductivities = pro.postprocessing_individual(predicted_conductivities, threshold)

        template = RecImg.read_mesh_template()
        RecImg.modify_mesh_individual(template, predicted_conductivities, username, 1, es_numpy = False)
        cadena1, marca1 = RecImg.get_octave_string(username, 1)

        octave.addpath(str(pathlib.Path(__file__).parent.absolute()))
        octave.eval(cadena1)
        return predicted_conductivities, marca1



    @staticmethod
    def reconstruct_img_several_models(id_models, username, id_dataset, mesh_index, postprocessing_flag = False):
        """It reconstructs the image of a mesh with each and every one of the models indicated by the first argument 
        of the method."""
        
        
        dataset = Dataset.objects.get(id = id_dataset)
        longitud = dataset.n_meshes()
        
        voltages = numpy.array(dataset.get_voltages()).astype('float32')[int(mesh_index)]
        conductivities_reales = numpy.array(dataset.get_conductivities()).astype('float32')[int(mesh_index)]

        octave.addpath(str(pathlib.Path(__file__).parent.absolute()))
        template = RecImg.read_mesh_template()
        octave.eval("run {}".format(gf.path_eidors()))

        RecImg.modify_mesh_individual_real(template, conductivities_reales, username, 0) #Mesh real
        cadena, marca_real = RecImg.get_octave_string(username, 0, load_eidors = False)
        list_marcas = []
        list_marcas.append(marca_real)
        octave.eval(cadena)

        i = 1
        
        for idm in id_models:
            
            m = gm.load_model(idm, username)
            predicted_conductivities = RecImg.predict_conductivity_loaded_model(voltages, m)
            
            if(postprocessing_flag):
                threshold = Model.objects.get(id = idm).postprocessing_threshold
                predicted_conductivities = pro.postprocessing_individual(predicted_conductivities, threshold)

            RecImg.modify_mesh_individual(template, predicted_conductivities, username, i)
            cadena, marca = RecImg.get_octave_string(username, i, load_eidors = False)
            list_marcas.append(marca)
            octave.eval(cadena)
            i+=1
        
        return mesh_index, list_marcas




