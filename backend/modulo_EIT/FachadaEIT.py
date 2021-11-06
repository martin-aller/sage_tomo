from .GestionFicheros import GestionFicheros as gf
from .GestionModelos import GestionModelos as gm
from .ReconstruccionImagenes import RecImg as ri
from .ProcesadoDatos import Procesado as pro
from .GestionDatasets import GestionDatasets as gd

#La clase FachadaEIT actúa como fachada del paquete modulo_EIT y contiene todos
#los métodos necesarios para hacer uso de las clases de dicho paquete.
#Línea de prueba.
#L2.

class FachadaEIT(object):
    #--------------------------------Métodos de GestionFicheros--------------------------------
    @staticmethod
    def construye_path_directorio(nombre_fichero, nombre_usuario):
        return gf.construye_path_directorio(nombre_fichero, nombre_usuario)


    @staticmethod
    def eliminar_ficheros(nombre_usuario): #Sin usar
        gf.eliminar_ficheros(nombre_usuario)

    @staticmethod
    def crea_directorio(nombre_usuario):
        gf.crea_directorio(nombre_usuario)
    
    @staticmethod
    def generar_fichero_dataset(dataset_id, nombre_usuario):
        gf.generar_fichero_dataset(dataset_id, nombre_usuario)

    @staticmethod
    def escribir_predicciones(nombre_usuario, voltajes, conductividades_predichas):
        gf.escribir_predicciones(nombre_usuario, voltajes, conductividades_predichas)

    @staticmethod
    def leer_predicciones(nombre_usuario):
        return gf.leer_predicciones(nombre_usuario)

    @staticmethod
    def eliminar_directorio_dataset(nombre_usuario, id_dataset):
        gf.eliminar_directorio_dataset(nombre_usuario, id_dataset)

    @staticmethod
    def eliminar_fichero_modelo(id):
        return gf.eliminar_fichero_modelo(id)




    #--------------------------------Métodos de GestionModelos--------------------------------
    @staticmethod
    def cargar_modelo(id_modelo_seleccionado, nombre_usuario):
        return gm.cargar_modelo(id_modelo_seleccionado, nombre_usuario)

    @staticmethod
    def entrenar_modelo(id):
        print("ID:", id)
        gm.entrenar_modelo(id)
        #gm.decir_AAA()

    @staticmethod
    def comparacion_modelos(nombre_usuario, lista_id_modelos, lista_metricas, id_dataset, postprocesar_flag):
        return gm.comparacion_modelos(nombre_usuario, lista_id_modelos, lista_metricas, id_dataset, postprocesar_flag)
    




    #--------------------------------Métodos de ReconstruccionImagenes--------------------------------
    @staticmethod
    def reconstruir_img(id_malla_seleccionada, id_modelo, nombre_usuario, postprocesado_flag = True):
        return ri.reconstruir_img(id_malla_seleccionada, id_modelo, nombre_usuario, postprocesado_flag)

    @staticmethod
    def reconstruir_img_individual(conductividades_predichas, id_modelo, nombre_usuario, postprocesado_flag = True):
        return ri.reconstruir_img_individual(conductividades_predichas, id_modelo, nombre_usuario, postprocesado_flag)
    
    @staticmethod
    def reconstruir_img_varios_modelos(id_modelos, nombre_usuario, id_dataset, indice_malla, postprocesado_flag = False):
        return ri.reconstruir_img_varios_modelos(id_modelos, nombre_usuario, id_dataset, indice_malla, postprocesado_flag)
    
    @staticmethod 
    def predecir_conductividades(id_modelo, fichero, nombre_usuario):
        return ri.predecir_conductividades(id_modelo, fichero, nombre_usuario)




    #--------------------------------Métodos de ProcesadoDatos--------------------------------
    @staticmethod
    def cortes(id_malla_real, conductividades_predichas, nombre_usuario, y_elegido):
        return pro.cortes(id_malla_real, conductividades_predichas, nombre_usuario, y_elegido)

    @staticmethod
    def obtener_valores(lista_diccionarios): #No sé si estoy usando esto para algo
        return pro.obtener_valores(lista_diccionarios)






    # #--------------------------------Métodos de GestionDatasets--------------------------------
    @staticmethod
    def iniciar_tarea_dataset(dataset, fichero_dataset = False, tupla_n_mallas = (0,0,0)):
        return gd.iniciar_tarea_dataset(dataset, fichero = fichero_dataset, tupla_n_mallas=tupla_n_mallas)
    

