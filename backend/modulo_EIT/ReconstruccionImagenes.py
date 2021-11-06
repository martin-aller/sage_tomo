from .GestionModelos import GestionModelos as gm
from .GestionFicheros import GestionFicheros as gf
from .ProcesadoDatos import Procesado as pro


from tomo.models import  Modelo, Dataset, Malla


import numpy
from oct2py import octave
import pathlib
import random
import time

class RecImg(object):

    @staticmethod
    def predecir_conductividad(voltajes, id_modelo, nombre_usuario):
        """Predice conductividades a partir de una lista de voltajes y devuelve una
        lista de conductividades."""

        #K.clear_session()
        loaded_model = gm.cargar_modelo(id_modelo, nombre_usuario)
        linea1_voltajes = [float(v) for v in voltajes]

        #Predicción
        prediccion = loaded_model.predict(numpy.array([linea1_voltajes]))
        prediccion = prediccion.tolist()
        return prediccion
  

    @staticmethod
    def predecir_conductividad_modelo_cargado(voltajes, modelo_cargado):
        """Predice conductividades utilizando el modelo ya cargado pasado como
        segundo parámetro. Deuvelve una lista de conductividades."""

        linea1_voltajes = [float(v) for v in voltajes]

        #Predicción
        prediccion = modelo_cargado.predict(numpy.array([linea1_voltajes]))
        prediccion = prediccion.tolist()

        return prediccion

    @staticmethod
    def predecir_conductividades(id_modelo, fichero, nombre_usuario):
        """Predice las conductividades a partir de los voltajes de un fichero
        de voltajes."""

        lista_voltajes = gf.leer_conjunto_voltajes(fichero, nombre_usuario)
        modelo = Modelo.objects.get(id = id_modelo)
        #n_elec = modelo.dataset.numero_electrodos
        #p_estim = modelo.dataset.patron_estimulacion

        if not gf.validar_estructura_fichero_voltajes(lista_voltajes):
            print("A4")
            raise Exception("Estructura del fichero incorrecta")
        modelo_cargado = gm.cargar_modelo(id_modelo, nombre_usuario)
        conductividades_predichas = modelo_cargado.predict(lista_voltajes)
        print("Longitud de la prediccion", len(conductividades_predichas))
        return lista_voltajes, conductividades_predichas
        
    @staticmethod
    def modificar_mallas(conductividades_reales, conductividades_predichas, nombre_usuario):
        """Con los valores de las conductividades reales y predichas pasados como primer y segundo
        parámetro, se modifica el fichero base utilizado para representar mallas."""

        plantilla = RecImg.leer_malla_plantilla()
        RecImg.modificar_malla_individual_real(plantilla, conductividades_reales, nombre_usuario, 1)
        RecImg.modificar_malla_individual(plantilla, conductividades_predichas, nombre_usuario, 2)

    @staticmethod
    def leer_malla_plantilla():
        """Lee el fichero plantilla .out para las mallas."""

        data = []
        with open(gf.construye_path('malla.out'), 'r') as file:
            data = file.readlines()
        return data[:]


    @staticmethod
    def modificar_malla_individual(plantilla, conductividades, nombre_usuario, n_malla, es_numpy = True):
        """Modifica el fichero .out de una única malla."""

        if es_numpy:
            conductividades = [str(e) + "\n" for e in conductividades[0]]
        else:
            conductividades = [str(e) + "\n" for e in conductividades]

        plantilla[4687:5531] = conductividades
        malla = "malla{}.out".format(n_malla)
        with open(gf.construye_path_directorio(malla, nombre_usuario), 'w') as file:
            file.writelines(plantilla)
    
    @staticmethod
    def modificar_malla_individual_real(plantilla, conductividades, nombre_usuario, n_malla):
        """Modifica el fichero .out de una única malla. Este método se utiliza cuando el usuario
        reconstruye la imagen de una malla cuya representación real se desconoce."""

        conductividades = [str(e) + "\n" for e in conductividades]
        plantilla[4687:5531] = conductividades
        malla = "malla{}.out".format(n_malla)
        with open(gf.construye_path_directorio(malla, nombre_usuario), 'w') as file:
            file.writelines(plantilla)

    #run /home/martin/versiones_eidors/eidors-v3.9.1-ng/eidors/startup.m
    @staticmethod
    def devuelve_cadena_octave(nombre_usuario, n_malla, cargar_eidors = True):
        """Devuelve un string con el código de octave necesario para representar la imagen
        de una malla."""

        marca = int(round(time.time() * 1000))

        malla_out = gf.construye_path_directorio("malla{}.out".format(n_malla), nombre_usuario)
        malla_png = gf.construye_path_imagenes("malla{}_{}_{}.png".format(n_malla, nombre_usuario, marca))
        
        if cargar_eidors == True:
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
        '''.format(eidors, malla_out, malla_png)

        return cadena, marca



    @staticmethod
    def reconstruir_img(id_malla_seleccionada, id_modelo, nombre_usuario, postprocesado_flag = True):
        """Reconstruye la imagen real de una malla y la imagen a partir de las predicciones realizadas
        por un modelo."""

        voltajes = Malla.objects.get(id = id_malla_seleccionada).voltajes
        conductividades_reales = Malla.objects.get(id = id_malla_seleccionada).conductividades
        conductividades_predichas = RecImg.predecir_conductividad(voltajes, id_modelo, nombre_usuario)

        if(postprocesado_flag):
            print("CONFIRMACIÓN DE QUE SE ESTÁ APLICANDO POSTPROCESADO.")
            umbral = Modelo.objects.get(id = id_modelo).umbral_postprocesado
            conductividades_predichas = pro.postprocesar_individual(conductividades_predichas, umbral)
        RecImg.modificar_mallas(conductividades_reales,conductividades_predichas, nombre_usuario)
        cadena1, marca1 = RecImg.devuelve_cadena_octave(nombre_usuario, 1)
        cadena2, marca2 = RecImg.devuelve_cadena_octave(nombre_usuario, 2, cargar_eidors = False)

        octave.addpath(str(pathlib.Path(__file__).parent.absolute()))
        octave.eval(cadena1)
        octave.eval(cadena2)
        return conductividades_predichas[0], (marca1, marca2) #Devuelve una lista contenida en una lista


    @staticmethod
    def reconstruir_img_individual(conductividades_predichas, id_modelo, nombre_usuario, postprocesado_flag = True):
        """Reconstruye la imagen a partir de las conductividades pasadas como primer parámetro del
        método."""

        if(postprocesado_flag):
            umbral = Modelo.objects.get(id = id_modelo).umbral_postprocesado
            conductividades_predichas = pro.postprocesar_individual(conductividades_predichas, umbral)

        plantilla = RecImg.leer_malla_plantilla()
        RecImg.modificar_malla_individual(plantilla, conductividades_predichas, nombre_usuario, 1, es_numpy = False)
        cadena1, marca1 = RecImg.devuelve_cadena_octave(nombre_usuario, 1)

        octave.addpath(str(pathlib.Path(__file__).parent.absolute()))
        octave.eval(cadena1)
        return conductividades_predichas, marca1


    @staticmethod
    def reconstruir_img_varios_modelos(id_modelos, nombre_usuario, id_dataset, indice_malla, postprocesado_flag = False):
        """Reconstruye la imagen de una malla con todos y cada uno de los modelos indicados mediante
        el primer argumento del método."""
        
        print("DATASET:", id_dataset)
        dataset = Dataset.objects.get(id = id_dataset)
        longitud = dataset.n_mallas()
        print("TIPO MALLA:", type(indice_malla))
        voltajes = numpy.array(dataset.obtiene_voltajes()).astype('float32')[int(indice_malla)]
        conductividades_reales = numpy.array(dataset.obtiene_conductividades()).astype('float32')[int(indice_malla)]

        octave.addpath(str(pathlib.Path(__file__).parent.absolute()))
        plantilla = RecImg.leer_malla_plantilla()
        octave.eval("run {}".format(gf.path_eidors()))

        RecImg.modificar_malla_individual_real(plantilla, conductividades_reales, nombre_usuario, 0) #Malla real
        cadena, marca_real = RecImg.devuelve_cadena_octave(nombre_usuario, 0, cargar_eidors = False)
        lista_marcas = []
        lista_marcas.append(marca_real)
        octave.eval(cadena)

        i = 1
        
        for idm in id_modelos:
            print("MODELO {}".format(idm))
            m = gm.cargar_modelo(idm, nombre_usuario)
            conductividades_predichas = RecImg.predecir_conductividad_modelo_cargado(voltajes, m)
            if(postprocesado_flag):
                umbral = Modelo.objects.get(id = idm).umbral_postprocesado
                conductividades_predichas = pro.postprocesar_individual(conductividades_predichas, umbral)

            RecImg.modificar_malla_individual(plantilla, conductividades_predichas, nombre_usuario, i)
            cadena, marca = RecImg.devuelve_cadena_octave(nombre_usuario, i, cargar_eidors = False)
            lista_marcas.append(marca)
            octave.eval(cadena)
            i+=1
        print("Llega sin problemas.")
        return indice_malla, lista_marcas




