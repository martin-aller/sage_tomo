import pathlib
import os
import csv
import numpy
import threading
from oct2py import Oct2Py
from math import ceil
import subprocess
import time

from tomo.models import  Dataset, Malla, Parametros

from .GestionFicheros import GestionFicheros as gf
from .GestionCorreos import GestionCorreos as gc
from celery import shared_task

#aaa

class GestionDatasets(object):
    """Contiene todos los métodos necesarios para la creación, subida y gestión
    de datasets."""

    @staticmethod
    def comprueba_longitud(lista_mallas, longitud):
        """Devuelve True si todas las mallas de la lista pasada como primer
        argumento tienen la longitud especificada en el segundo argumento."""

        lista_bool = map(lambda x: (len(x) == longitud), lista_mallas)
        
        mismas = all(lista_bool)
        return mismas



    @staticmethod
    def validar_estructura_fichero_dataset(dataset, lista_mallas):
        """Comprueba que el fichero tiene la estructura adecuada si
        se emplean 16 electrodos y un patrón de estimación adyacente."""

        estructura_correcta = False
        n_elec = 16
        p_estim = "adyacente"

        if int(n_elec) == 16 and str(p_estim) == "adyacente":
            print("A0")
            estructura_correcta = GestionDatasets.comprueba_longitud(lista_mallas, 208 + 844 + 1)
        return estructura_correcta




    @staticmethod
    def iniciar_tarea_dataset(dataset, fichero = False, tupla_n_mallas = (0,0,0)):
        """Inicia una subida o una generación de un dataset. En caso de que el parámetro
        'fichero' sea True, se iniciará la subida de un dataset. En caso contrario,
        se iniciará la generación de un dataset. En ambos casos, se utilizará la información
        contenida en el objeto pasado como primer argumento del método."""

        if (type(fichero) != bool):
            nombre_usuario = dataset.creador.get_username()
            direc = gf.construye_path_directorio("nuevo_dataset{}.csv".format(dataset.id), nombre_usuario)
            with open(direc, 'wb+') as destino:
                #for chunk in f.chunks():
                destino.write(fichero.read())
            lista_mallas = GestionDatasets.leer_nuevo_dataset(nombre_usuario, dataset)
            if not GestionDatasets.validar_estructura_fichero_dataset(dataset, lista_mallas):
                raise Exception("Estructura del fichero incorrecta")
            tarea = GestionDatasets.insertar_dataset.delay(dataset.id,lista_mallas)

        else:
            tarea = GestionDatasets.generar_dataset.delay(dataset.id,tupla_n_mallas)
            dataset.estado = str(tarea.id)
            dataset.save()
        
    
    @staticmethod
    def filtra_filas(lista_mallas, n):
        filas = [f for f in lista_mallas if f[-1] == n]
        return filas
        
    @staticmethod
    def leer_nuevo_dataset(nombre_usuario, dataset):
        lista_completa = []
        direc = gf.construye_path_directorio("nuevo_dataset{}.csv".format(dataset.id), nombre_usuario)

        with open(direc) as csvfile:
            fichero = csv.reader(csvfile, delimiter=';')
            for fila in fichero:
                lista_completa.append(fila)
        return lista_completa


    @staticmethod
    @shared_task
    def insertar_dataset(id_dataset, lista_mallas): #Uso id_dataset en vez de dataset porque necesito que sea serializable con Celery
        """Realiza la tarea de inserción de un dataset en la BD, una vez
        que se han extraido los voltajes y conductividades del fichero subido
        por el usuario."""
        
        dataset = Dataset.objects.get(id = id_dataset)
        inicio = time.time()
        mallas_n1 = GestionDatasets.filtra_filas(lista_mallas, "1")
        mallas_n2 = GestionDatasets.filtra_filas(lista_mallas, "2")
        mallas_n3 = GestionDatasets.filtra_filas(lista_mallas, "3")
        grupos_mallas = [mallas_n1, mallas_n2, mallas_n3]

        dataset.estado = str(threading.get_ident())
        dataset.save()
        
        indice = 0
        lista_mallas_crear = []

        print("LLEGA AAAAAAABBBBBCCCC")
        for i in range(len(grupos_mallas)): #Iterará tres veces
            for m in grupos_mallas[i]:
                malla = Malla(indice = indice, numero_artefactos = i+1, dataset = dataset, voltajes = m[:208], conductividades = m[208:-1])
                lista_mallas_crear.append(malla)

                indice+=1

        Malla.objects.bulk_create(lista_mallas_crear) #Inserto todas las mallas en un único acceso a la BD
        

     
        dataset.estado = "pendiente"
        nombre_usuario = dataset.creador.get_username()
        nombre_fichero = "nuevo_dataset{}.csv".format(dataset.id)
        gf.eliminar_fichero_individual(nombre_usuario, nombre_fichero)
        dataset.save()
        fin = time.time()
        print("Tiempo:", fin - inicio)


    @staticmethod
    def forward_model_octave(primera_malla, ultima_malla, path_dataset, carpeta):
        """Llama a los métodos de Octave para calcular el forward-model sobre los ficheros
        especificados. Este método es utilizado por el método calcula_forward_model."""
        
        print("BUENOS DÍAS.")
        cadena = '''
        run {};
        primera_malla_a_procesar = {};
        ultima_malla_a_procesar = {};

        carpeta = {};

        entrada = strcat('{}mallas/', carpeta, '/');
        salida = strcat('{}forwardModel/', carpeta, '/');
        mkdir(salida)

        stim = mk_stim_patterns(16,1,'{}','{}',{},1);

        for i=primera_malla_a_procesar:ultima_malla_a_procesar
            load([entrada num2str(i) ".out"]);

            img.fwd_model.stimulation = stim;
            img.fwd_solve.get_all_meas = 1;
            vh = fwd_solve(img);
            
            dlmwrite([salida num2str(i) ".csv"], vh.meas', ";");
        end
        '''.format(gf.path_eidors(), str(primera_malla), str(ultima_malla), str(carpeta), path_dataset, path_dataset,"{ad}","{ad}","{}")

        oct = Oct2Py()
        oct.eval(cadena)

        print("OCTAVE FIN")


    @staticmethod
    def calcula_forward_model(dataset, n1_r, n2_r, n3_r):
        """Aplica el forward-model sobre los valores almacenados en los ficheros
        generados por el módulo de C++."""

        path_dataset = gf.construye_path_dir_dataset(dataset, "")
        for i in range(dataset.r_min, dataset.r_max + 1):
            GestionDatasets.forward_model_octave(1, n1_r, path_dataset, "'1obj/" + str(i) + "'")
            
        for i in range(dataset.r_min, dataset.r_max + 1):
            GestionDatasets.forward_model_octave(1, n2_r, path_dataset, "'2obj/" + str(i) + "'")

        for i in range(dataset.r_min, dataset.r_max + 1):
            GestionDatasets.forward_model_octave(1, n3_r, path_dataset, "'3obj/" + str(i) + "'")


    @staticmethod
    def obtiene_n_artefactos_por_radio(n1, n2, n3, nr):
        """Devuelve cuantas mallas de 1,2 y 3 artefactos se deben generar
        para cada radio."""

        n1_r = ceil(n1/nr)
        n2_r = ceil(n2/nr)
        n3_r = ceil(n3/nr)	
        return n1_r, n2_r, n3_r


    #Mediante el último parámetro de format, consigo que los archivos se eliminen carpeta a carpeta, empezando
    #en la carpeta de radio 4. Elimino siempre el primer archivo de cada carpeta de radio.



    #Al hacer el ceil, después obtengo la diferencia entre el número introducido por el usuario y el calculado (lo obtenido por ceil multiplicado por 6).
    #Después, si la diferencia es igual a X, elimino las X últimas mallas de la carpeta de mallas y las X últimas mallas de la carpeta de forward model.
    #En ambos casos, serán mallas de la subcarpeta correspondiente de radio 10.


    @staticmethod
    def genera_mallas(dataset, n1_r, n2_r, n3_r):
        """Llama al módulo de C++ para generar las mallas según los parámetros
        definidos por el usuario."""

        print("INICIO")
        f = open(gf.construye_path_modC("salida.txt"), "w")
        main_ejec = gf.construye_path_modC("main")
        subprocess.Popen([main_ejec,  str(n1_r), str(n2_r), str(n3_r), str(dataset.r_min), str(dataset.r_max), str(dataset.creador.get_username()), str(dataset.id), str(dataset.semilla)], stdout = f)

        f.close()
        print("FIN")
        



    @staticmethod
    def insertar_mallas_generacion(dataset, lista_voltajes, lista_conductividades, n1,n2,n3):
        """Inserta en la BD las mallas generadas en una tarea de generación
        de un dataset."""
        
        ln = [n1,n2,n3]
        
        lista_mallas_crear = []

        for i in range(len(ln)):
            for j in range(ln[i]):
                indice = sum(ln[:i]) + j
                malla = Malla(indice = indice, numero_artefactos = i+1, dataset = dataset, voltajes = lista_voltajes[indice],
                            conductividades = lista_conductividades[indice])
                lista_mallas_crear.append(malla)
                #indice+=1
        Malla.objects.bulk_create(lista_mallas_crear) #Inserto todas las mallas en un único acceso a la BD




    @staticmethod
    @shared_task
    def generar_dataset(id_dataset, tupla_n_mallas): #Uso id_dataset en vez de dataset porque necesito que sea serializable con Celery
        """Realiza todas las llamadas a los métodos definidos anteriormente para
        generar un dataset e insertarlo en la BD."""
        
        dataset = Dataset.objects.get(id = id_dataset)
        print("Inicio generación.")
        gf.crear_dir_dataset_temp(id_dataset)
        n1 = tupla_n_mallas[0]
        n2 = tupla_n_mallas[1]
        n3 = tupla_n_mallas[2]
        print("TUPLA:", tupla_n_mallas)

        nr = dataset.r_max - dataset.r_min + 1 #Nº de radios diferentes
        n1_r, n2_r, n3_r = GestionDatasets.obtiene_n_artefactos_por_radio(n1, n2, n3, nr)
        print("ARTEFACTOS POR RADIO: ", n1_r, n2_r, n3_r)
        print("GENERA MALLAS")
        GestionDatasets.genera_mallas(dataset, n1_r, n2_r, n3_r)
        print("CALCULA FORWARD MODEL")
        GestionDatasets.calcula_forward_model(dataset, n1_r,n2_r,n3_r)
        print("ACABA EL CÁLCULO")

        s1 = n1_r*nr - n1 #Nº de cuerpos sobrantes de 1 malla
        s2 = n2_r*nr - n2
        s3 = n3_r*nr - n3

        print("s1,s2,s3:", s1,s2,s3)

        gf.elimina_sobrantes(dataset, s1,s2,s3)
        lista_voltajes,lista_conductividades = gf.lee_voltajes_conductividades(dataset)
        GestionDatasets.insertar_mallas_generacion(dataset, lista_voltajes, lista_conductividades, n1 ,n2 ,n3)

        dataset.estado = "pendiente"
        dataset.save()
        #dataset.delete()
        gf.eliminar_directorio_dataset(dataset.creador.get_username(), dataset.id)

        gc.enviar_correo_dataset(dataset, dataset.creador.email)
        print("Dataset guardado.")

        


    
