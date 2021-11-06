import pathlib
import os
import csv
import numpy
import fnmatch
from tomo.models import  Dataset, Modelo
import shutil

class GestionFicheros(object):
    """Esta clase es utilizada por las demás clases siempre que necesitan tratar o
    gestionar ficheros."""
    
    @staticmethod
    def construye_path(nombre_fichero):
        path_actual = str(pathlib.Path(__file__).parent.absolute())
        path_completo = path_actual + "/" + nombre_fichero
        return path_completo


    @staticmethod
    def construye_path_directorio(nombre_fichero, nombre_usuario):
        """Devuelve el path completo del directorio de un usuario, concatenando al
        final el nombre del fichero pasado como primer argumento."""

        path_generico = pathlib.Path(__file__).parent.parent
        path_completo = os.path.join(path_generico, 'directorio_usuarios', nombre_usuario, nombre_fichero)
        return path_completo


    @staticmethod
    def construye_path_imagenes(nombre_fichero):
        """Devuelve el path en el que se almacenan las imágenes temporales, concatenando
        al final el nombre del fichero."""

        path_generico = pathlib.Path(__file__).parent.parent
        #path_imagenes = str(path_generico) + "/tomo/static/tomo/images/" + nombre_fichero
        path_imagenes = str(path_generico) + "/media/images/" + nombre_fichero

        return path_imagenes


    @staticmethod
    def path_eidors():
        path_generico = pathlib.Path(__file__).parent.parent
        path_eidors = os.path.join(path_generico, 'eidors-v3.9.1-ng', 'eidors', 'startup.m')
        return path_eidors


    @staticmethod
    def construye_path_modelo(id_modelo):
        path_generico = pathlib.Path(__file__).parent.parent
        path_modelos = os.path.join(path_generico, 'modelos', str(id_modelo))
        return path_modelos


    @staticmethod
    def construye_path_datasets(nombre_fichero):
        path_generico = pathlib.Path(__file__).parent.parent
        #path_imagenes = str(path_generico) + "/tomo/static/tomo/images/" + nombre_fichero
        path_imagenes = str(path_generico) + "/media/datasets/" + nombre_fichero

        return path_imagenes

    @staticmethod
    def leer_fichero_completo(nombre_fichero):
        '''Lee un fichero que contiene en cada línea 208 lista_voltajes
        y 844 valores de impedancia eléctrica. Devuelve una lista con los lista_voltajes
        y una lista con los valores de impedancia.
        '''
        lista_completa = []
        with open(GestionFicheros.construye_path(nombre_fichero)) as csvfile:
            fichero = csv.reader(csvfile, delimiter=';')
            for fila in fichero:
                lista_completa.append(fila)
        lista_completa = numpy.array(lista_completa).astype('float32')
        lista_voltajes = lista_completa[:,0:208]
        lista_impedancia = lista_completa[:,208:]

        return lista_voltajes,lista_impedancia


    @staticmethod
    def leer_coordenadas():
        coordenadas = []
        with open(GestionFicheros.construye_path("x-y.csv")) as f:
            fichero_entrada = csv.reader(f, delimiter=',')
            for fila in fichero_entrada:
                coordenadas.append(fila)

        coordenadas = coordenadas[1:] #La primera línea es el header
        coordenadas = numpy.array(coordenadas).astype('float32')

        print("Longitud de coordenadas:", len(coordenadas))
        return coordenadas

    @staticmethod
    def eliminar_imagenes(nombre_usuario):
        """Elimina todas las imágenes creadas por el usuario durante la sesión."""

        lista_ficheros = os.listdir(GestionFicheros.construye_path_imagenes("")) #Obtengo los ficheros del directorio de imágenes
        ficheros_eliminar = fnmatch.filter(lista_ficheros, "*_" + nombre_usuario + ".png")
        ficheros_eliminar_cortes = fnmatch.filter(lista_ficheros, "cortes_" + nombre_usuario + "_?????????????.png")

        for f in ficheros_eliminar:
            os.remove(GestionFicheros.construye_path_imagenes(f))
        for f in ficheros_eliminar_cortes:
            os.remove(GestionFicheros.construye_path_imagenes(f))
            
    @staticmethod
    def vaciar_directorio_usuario(nombre_usuario):
        """Elimina todos los ficheros auxiliares
        generados por el usuario durante la sesión."""

        ficheros_eliminar = os.listdir(GestionFicheros.construye_path_directorio("", nombre_usuario)) #Obtengo los ficheros del directorio modulo_IA
        print("Vaciar:", ficheros_eliminar)
        for f in ficheros_eliminar:
            nombre_fichero = GestionFicheros.construye_path_directorio(f, nombre_usuario)
            if(os.path.isfile(nombre_fichero)):
                os.remove(nombre_fichero)
            else:
                print("Eliminar directorio.")
                shutil.rmtree(nombre_fichero)



    @staticmethod
    def eliminar_ficheros(nombre_usuario):
        """Elimina tanto ficheros auxiliares como imágenes."""

        GestionFicheros.eliminar_imagenes(nombre_usuario)
        GestionFicheros.vaciar_directorio_usuario(nombre_usuario)
        print("ELIMINAR.")



    @staticmethod
    def eliminar_fichero_modelo(id):
        """Elimina el fichero auxiliar asociado a la carga de un modelo."""

        tipo_modelo = Modelo.objects.get(id = id).tipo
        if tipo_modelo == "DNN":
            path_modelo = GestionFicheros.construye_path_modelo(id)
            path_json = path_modelo + ".json"
            path_h5 = path_modelo + ".h5"
            os.remove(path_json)
            os.remove(path_h5)
        else:
            path_modelo = GestionFicheros.construye_path_modelo(id) + ".joblib"
            os.remove(path_modelo)

        print("ELIMINAR MODELO.")



    @staticmethod
    def generar_fichero_dataset(dataset_id, nombre_usuario):
        """Genera un fichero con la información de un dataset cuando el usuario
        selecciona la opción de descargarlo."""

        dataset = Dataset.objects.get(id = dataset_id)

        lista_voltajes = dataset.obtiene_voltajes()
        lista_conductividades = dataset.obtiene_conductividades()

        lineas = list(map(lambda x,y: x + y, lista_voltajes, lista_conductividades))
            
        nombre_fichero = GestionFicheros.construye_path_datasets(nombre_usuario + "_dataset" + str(dataset_id) + ".csv")
        
        with open(nombre_fichero, "w") as f:
            writer = csv.writer(f, delimiter = ";")
            writer.writerows(lineas)

    @staticmethod
    def crea_directorio(nombre_usuario):
        """Crea un directorio para un nuevo usuario."""
        path_generico = pathlib.Path(__file__).parent.parent
        path_completo = os.path.join(path_generico, 'directorio_usuarios', nombre_usuario)
        try:
            os.mkdir(path_completo)
        except FileExistsError:
            print("El directorio {} ya existe".format(path_completo))


    @staticmethod
    def eliminar_fichero_individual(nombre_usuario, nombre_fichero):
        """Elimina un fichero particular de un determinado usuario."""
        print("ELIMINACIÓN")
        nombre_fichero = GestionFicheros.construye_path_directorio(nombre_fichero, nombre_usuario)
        if(os.path.isfile(nombre_fichero)):
            os.remove(nombre_fichero)
        else:
            shutil.rmtree(nombre_fichero)

    

    @staticmethod
    def crear_dir_dataset_temp(id_dataset):
        """Crea un directorio temporal para la descarga de un dataset por
        parte de un usuario."""
        dataset = Dataset.objects.get(id = id_dataset)
        path_generico = pathlib.Path(__file__).parent.parent
        path_completo = os.path.join(path_generico, 'directorio_usuarios', dataset.creador.get_username(), "dataset" + str(dataset.id))
        try:
            os.mkdir(path_completo)
        except FileExistsError:
            print("El directorio {} ya existe".format(path_completo))


    @staticmethod
    def construye_path_dir_dataset(dataset, nombre_fichero):
        """Devuelve el path de un directorio temporal para un dataset."""
        path_generico = pathlib.Path(__file__).parent.parent
        path_completo = os.path.join(path_generico, 'directorio_usuarios', dataset.creador.get_username(), "dataset" + str(dataset.id), nombre_fichero)
        return path_completo

    @staticmethod
    def construye_path_modC(nombre_fichero):
        path_generico = pathlib.Path(__file__).parent.parent
        path_completo = os.path.join(path_generico, 'modulo_C', nombre_fichero)
        return path_completo



    @staticmethod
    def ordenar_ficheros(l, extension):
        lm = [int(s[:-4]) for s in l]
        lm.sort()
        lm2 = [str(n) + extension for n in lm]
        return lm2


    @staticmethod
    def lee_voltajes_conductividades(dataset):
        """Lee voltajes y conductividades de los ficheros generados por el módulo de C++
        y genera dos listas, las cuales devuelve."""

        lista_voltajes = []
        lista_conductividades = []
        for n_obj in range(1,4): # Nº de objetos
            n_a = 0
            n_b = 0
            for n_rad in range(dataset.r_min,dataset.r_max + 1): # Tamaño de radio
                sub_path =  "forwardModel/{}obj/{}".format(str(n_obj), str(n_rad))
                path_radio_voltajes = GestionFicheros.construye_path_dir_dataset(dataset,sub_path) 
                ficheros_csv = os.listdir(path_radio_voltajes)
                ficheros_csv.sort()
                #ficheros_csv = GestionFicheros.ordenar_ficheros(ficheros_csv, ".csv")

                n_a = n_a + len(ficheros_csv)
                for f in ficheros_csv:
                    f_completo = os.path.join(path_radio_voltajes, f)
                    with open(f_completo, 'r') as f_csv:
                        fichero = csv.reader(f_csv, delimiter=';') #Lee una única línea, porque los ficheros sólo tienen una línea.
                        lista_voltajes.append(list(fichero)[0])

                sub_path =  "mallas/{}obj/{}".format(str(n_obj), str(n_rad))
                path_radio_conductividades = GestionFicheros.construye_path_dir_dataset(dataset,sub_path) 
                ficheros_out = os.listdir(path_radio_conductividades)
                ficheros_out.sort()
                #ficheros_out = GestionFicheros.ordenar_ficheros(ficheros_out, ".out")

                n_b = n_b + len(ficheros_out)
                for f in ficheros_out:
                    f_completo = os.path.join(path_radio_conductividades, f)
                    with open(f_completo, 'r') as f_out:
                        data = f_out.readlines()                        
                        lista_conductividades.append(data[4687:5531])

            print("LEN CSV{}:".format(n_obj), n_a)
            print("LEN OUT{}:".format(n_obj), n_b)

        print("LV, LI:", len(lista_voltajes), len(lista_conductividades))
        print("LV0:", len(lista_voltajes[0]))
        print("LI0:", len(lista_conductividades[0]))

        return lista_voltajes,lista_conductividades


    @staticmethod
    def leer_conjunto_voltajes(fichero, nombre_usuario):
        direc = GestionFicheros.construye_path_directorio("conjunto_voltajes.csv", nombre_usuario)
        with open(direc, 'wb+') as destino:
            #for chunk in f.chunks():
            destino.write(fichero.read())

        lista_voltajes = []
        with open(direc, "r") as csvfile:
            fichero = csv.reader(csvfile, delimiter=';')
            for fila in fichero:
                lista_voltajes.append(fila)

        lista_voltajes = numpy.array(lista_voltajes).astype('float32')
        return lista_voltajes


    @staticmethod
    def escribir_predicciones(nombre_usuario, voltajes, conductividades_predichas):
        voltajes = [list(v) for v in voltajes]
        conductividades_predichas = [list(i) for i in conductividades_predichas]
        lista_escribir = list(map(lambda x,y: x + y, voltajes, conductividades_predichas))
        nombre_fichero = GestionFicheros.construye_path_directorio("predicciones.csv", nombre_usuario)
        with open(nombre_fichero, "w") as f:
            writer = csv.writer(f, delimiter = ";")
            writer.writerows(lista_escribir)


    @staticmethod
    def leer_predicciones(nombre_usuario):
        lista_completa = []
        nombre_fichero = GestionFicheros.construye_path_directorio("predicciones.csv", nombre_usuario)
        print(nombre_fichero)

        with open(nombre_fichero, "r") as csvfile:
            fichero = csv.reader(csvfile, delimiter=';')
            #print("LEN FICHERO", len(fichero))
            for fila in fichero:
                lista_completa.append(fila)
        lista_completa = numpy.array(lista_completa).astype('float32')

        lista_impedancia = lista_completa[:,208:]
        
        lista_impedancia = list(lista_impedancia)
        lista_impedancia = [list(imp) for imp in lista_impedancia]

        return lista_impedancia

    @staticmethod
    def eliminar_directorio_dataset(nombre_usuario, id_dataset):
        """Elimina el directorio temporal creado para la descarga."""
        path_generico = pathlib.Path(__file__).parent.parent
        ruta_dataset = os.path.join(path_generico, 'directorio_usuarios', nombre_usuario, "dataset" + str(id_dataset) + "/")
        print("RUTA:", ruta_dataset)
        #shutil.rmtree(ruta_dataset)
        shutil.rmtree(ruta_dataset, ignore_errors=True)

    


    @staticmethod
    def elimina_sobrantes(dataset, s1,s2,s3):
        """Elimina ficheros innecesarios que se crean durante la generación
        de un dataset."""
        raiz =  GestionFicheros.construye_path_dir_dataset(dataset,"{}/{}obj/{}/1.{}")   # 1. porque eliminaré la primera malla de cada carpeta en la que sea necesario
        for i in range(s1):
            os.remove(raiz.format("mallas", str(1), str(4+i), "out"))
            os.remove(raiz.format("forwardModel", str(1), str(4+i), "csv"))
        for i in range(s2):
            os.remove(raiz.format("mallas", str(2), str(4+i), "out"))
            os.remove(raiz.format("forwardModel", str(2), str(4+i), "csv"))
        for i in range(s3):
            os.remove(raiz.format("mallas", str(3), str(4+i), "out"))
            os.remove(raiz.format("forwardModel", str(3), str(4+i), "csv"))
   
    @staticmethod
    def comprueba_longitud(lista_voltajes, longitud):
        """Comprueba que la longitud de cada línea de un fichero de voltajes
        coincide con la longitud especificada como segundo parámetro."""

        lista_bool = map(lambda x: (len(x) == longitud), lista_voltajes)
        
        mismas = all(lista_bool)
        return mismas


    @staticmethod
    def validar_estructura_fichero_voltajes(lista_voltajes, n_elec = 16, p_estim = "adyacente"):
        """Comprueba que un fichero de voltajes contiene en cada línea la estructura
        adecuada."""
        estructura_correcta = False

        if int(n_elec) == 16 and str(p_estim) == "adyacente":
            print("A0")
            estructura_correcta = GestionFicheros.comprueba_longitud(lista_voltajes, 208)
        return estructura_correcta
  




    