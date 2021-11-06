from tensorflow.keras import models,layers,Input,Model,optimizers,losses
from tensorflow.keras.utils import plot_model
from tensorflow.keras.models import model_from_json
#from keras import backend as K

from sklearn.ensemble import RandomForestRegressor
from sklearn import svm
from sklearn.multioutput import MultiOutputRegressor
from sklearn import metrics

from tomo.models import  Dataset
from tomo.models import Modelo, Modelo_red_neuronal, Modelo_random_forest, Modelo_maquina_soporte_vectorial, Metrica
from django.utils import timezone

import os
import joblib
import numpy


from .GestionFicheros import GestionFicheros as gf
from .ProcesadoDatos import Procesado as pro
from .GestionCorreos import GestionCorreos as gc
from celery import shared_task

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '1' #Para que TensorFlow imprima sólo los errores en lugar de todos los mensajes de log.

#K.clear_session()


class GestionModelos:

    @staticmethod
    def cargar_modelo(id_modelo_seleccionado, nombre_usuario):
        '''
        Carga el modelo cuyo ID es el indicado en el primer argumento y devuelve
        un objeto con el fichero cargado.
        '''
        print("--------------EMPIEZA CARGA-------------------")
        tipo_modelo = Modelo.objects.get(id = id_modelo_seleccionado).tipo

        if (tipo_modelo == 'DNN'):
            #Cargo el modelo de archivo JSON 
            path_json = gf.construye_path_modelo(id_modelo_seleccionado) + ".json"
            path_h5 = gf.construye_path_modelo(id_modelo_seleccionado) + ".h5"

            json_file = open(path_json, 'r')
            loaded_model_json = json_file.read()
            json_file.close()
            loaded_model = model_from_json(loaded_model_json)

            #Cargo los pesos de un archivo HDF5 y se los asigno al modelo
            loaded_model.load_weights(path_h5)

        else:
            path_modelo = gf.construye_path_modelo(id_modelo_seleccionado) + ".joblib"
            loaded_model = joblib.load(path_modelo)

        print("--------------FINALIZA CARGA-------------------")
        return loaded_model




    @staticmethod
    def almacenar_modelo(modelo_entrenado, modelo_generico):
        '''
        En caso de que el tamaño del modelo generado sea inferior a 100 MB, almacena
        el binario en el campo binario_modelo de la tabla de modelos genéricos. En caso
        de que el tamaño sea superior, genera un path mediante una hash dentro del directorio almacenamiento_modelos,
        guarda el modelo en ese directorio y almacena el path generado en el campo path_modelo
        de la tabla genérica de modelos.
        '''
        if (modelo_generico.tipo == "DNN"):
            model_json = modelo_entrenado.to_json()
            path_definitivo_json = gf.construye_path_modelo(modelo_generico.id) + ".json"
            path_definitivo_h5 = gf.construye_path_modelo(modelo_generico.id) + ".h5"
            
            with open(path_definitivo_json, "w") as json_file:
                json_file.write(model_json)

            modelo_entrenado.save_weights(path_definitivo_h5)

        else:
            path_modelo = gf.construye_path_modelo(modelo_generico.id) + ".joblib" #REVISAR
            joblib.dump(modelo_entrenado, open(path_modelo, 'wb'))





    @staticmethod
    def entrenar_modelo(id):
        modelo = Modelo.objects.get(id = id)

        if (modelo.tipo == 'DNN'):
            tarea = GestionModelos.entrenar_red_neuronal.delay(id)
            #print("ID TAREA:", tarea.id)
        elif (modelo.tipo == 'RF'):
            tarea =GestionModelos.entrenar_random_forest.delay(id)
        elif(modelo.tipo == 'SVM'):
            tarea = GestionModelos.entrenar_maquina_soporte.delay(id)

        modelo.estado = str(tarea.id)
        modelo.save()




    @staticmethod
    @shared_task
    def entrenar_red_neuronal(id):
        """Entrena y almacena una red neuronal."""

        print("INICIO RED NEURONAL")
        
        #K.clear_session()
        
        print("A")
        modelo = Modelo.objects.get(id = id)
        modelo_ann = Modelo_red_neuronal.objects.get(id_modelo = id)
        print("B")
        train_input, train_output, test_input, test_output, validation_input, validation_output = modelo.dataset.obtiene_conjuntos(validacion = True)
        
        print("LEN_TRI", len(train_input))
        print("LEN_TO", len(test_output))
        print("LEN_VI", len(validation_input))
        print("LEN_VO", len(validation_output))
        train_input = numpy.array(train_input).astype('float32')
        train_output = numpy.array(train_output).astype('float32')
        test_input = numpy.array(test_input).astype('float32')
        test_output = numpy.array(test_output).astype('float32')
        validation_input = numpy.array(validation_input).astype('float32')
        validation_output = numpy.array(validation_output).astype('float32')
        #----------------------------------------------------------------------------------------------------------------
        # # ----------Definición del modelo----------
        print("Definiendo modelo...")
        model = models.Sequential()
        print("Definiendo capa de entrada y capas ocultas...")
        print("Neuronas por capa:")
        model.add(layers.Dense(modelo_ann.neuronas_por_capa[0], input_dim=208))
        model.add(layers.Activation(modelo_ann.funcion_activacion_interna))
        if (modelo_ann.capas_ocultas > 1):
            for n in modelo_ann.neuronas_por_capa[1:]: #El primer elemento no se utiliza
                model.add(layers.Dense(n))
                model.add(layers.Activation(modelo_ann.funcion_activacion_interna))
        print("Definiendo capa de salida...")
        model.add(layers.Dense(844))
        model.add(layers.Activation(modelo_ann.funcion_activacion_salida))
        print("Modelo definido.")
        lista_metricas_DAO = Metrica.objects.filter(id_modelo_id = id).order_by("id")
        lista_metricas = pro.obtener_valores(lista_metricas_DAO.values("nombre_metrica"))
        
        if "acierto" in lista_metricas:
            lista_metricas.remove("acierto")
        #Por ahora no uso momentum:  momentum = modelo_ann.momentum
        #En la versión antigua de Keras, RMSprop no tiene este atributo
        # ----------Especificación de la configuración de entrenamiento----------
        model.compile(optimizer = optimizers.RMSprop(lr = modelo_ann.learning_rate),  # Optimizador
                    # Función de error a minimizar
                    loss = modelo_ann.funcion_error,
                    # Lista de métricas para monitorizar
                    metrics =  lista_metricas)
        print("Configuración de entrenamiento definida.")
        # ----------Ajustar modelo a los datos de entrenamiento----------
        print("Ajustar modelo a los datos de entrenamiento:")
        if modelo_ann.lotes != None:
            tamanho_lotes = modelo_ann.lotes
        else:
            tamanho_lotes = len(train_input)
        history = model.fit(train_input, train_output,
                            batch_size = tamanho_lotes,
                            epochs = modelo_ann.epocas,
                            validation_data=(validation_input, validation_output))
        # ----------Evaluar modelo mediante el conjunto de test----------
        print("\nEvaluación del modelo:")
        pred_output = model.predict(test_input)
        pro.asignar_umbral(modelo,test_output, pred_output)
        pred_output = pro.postprocesar(pred_output, modelo.umbral_postprocesado)
        pro.asigna_valores_metricas_generico(lista_metricas_DAO, test_output, pred_output, id_modelo = id)
    
        # ----------Guardar arquitectura en JSON y pesos del modelo en HDF5----------
        GestionModelos.almacenar_modelo(model, modelo)
        print("Modelo guardado en disco.")
        modelo.estado = "pendiente"
        modelo.fecha_hora_fin = timezone.now()
        modelo.save() #Necesario por haber asignado umbral
        modelo_ann.save()
        
        #Una vez que el entrenamiento finaliza, se envía un correo al Usuario
        correo_usuario = Modelo.objects.get(id = id).creador.email
        print("Correo:", correo_usuario)
        gc.enviar_correo_modelo(modelo, correo_usuario)



    @staticmethod
    @shared_task
    def entrenar_random_forest(id):
        """Entrena y almacena un Random Forest."""

        modelo_generico = Modelo.objects.get(id = id)
        modelo_ad = Modelo_random_forest.objects.get(id_modelo = id)

        train_input, train_output, test_input, test_output, _, _ = modelo_generico.dataset.obtiene_conjuntos()


        train_input = numpy.array(train_input).astype('float32')
        train_output = numpy.array(train_output).astype('float32')

        test_input = numpy.array(test_input).astype('float32')
        test_output = numpy.array(test_output).astype('float32')

        print("N ESTIMADORES:", modelo_ad.n_estimadores)
        # ----------Definición del modelo----------
        print("\nDefiniendo el modelo.")
        modelo = RandomForestRegressor(n_estimators = modelo_ad.n_estimadores, random_state=0)

        # ----------Entrenamiento de modelo----------
        print("Entrenando modelo:")
        modelo.fit(train_input,train_output)


        # ----------Evaluar modelo mediante el conjunto de test---------
        print("\nEvaluación del modelo:")
        pred_output = modelo.predict(test_input)
        pro.asignar_umbral(modelo_generico,test_output, pred_output)
        pred_output = pro.postprocesar(pred_output, modelo_generico.umbral_postprocesado)
        lista_metricas_DAO = Metrica.objects.filter(id_modelo_id = id).order_by("id")
        pro.asigna_valores_metricas_generico(lista_metricas_DAO, test_output, pred_output, id_modelo = id)

        # ----------Guardar binario del modelo----------
        GestionModelos.almacenar_modelo(modelo, modelo_generico)
        modelo_generico.estado = "pendiente"
        modelo_generico.fecha_hora_fin = timezone.now()
        modelo_generico.save()

        #Una vez que el entrenamiento finaliza, se envía un correo al Usuario
        correo_usuario = modelo_generico.creador.email
        print("Correo:", correo_usuario)
        gc.enviar_correo_modelo(modelo_generico, correo_usuario)


    @staticmethod
    @shared_task
    def entrenar_maquina_soporte(id):
        """Entrena y almacena una SVM"""

        modelo_generico = Modelo.objects.get(id = id)

        train_input, train_output, test_input, test_output, _, _ = modelo_generico.dataset.obtiene_conjuntos()

        train_input = numpy.array(train_input).astype('float32')
        train_output = numpy.array(train_output).astype('float32')

        test_input = numpy.array(test_input).astype('float32')
        test_output = numpy.array(test_output).astype('float32')

        #Definición del modelo
        print("Definición del modelo.")
        modelo = svm.SVR(kernel='rbf', degree = 3, gamma = "auto", coef0 = 100, tol=7, C = 1200000.0, epsilon = 0.1) #x,y = 100 ---> MSE = 1780.18 #x,y = 1000 ---> MSE = 1098.85

        wrapper = MultiOutputRegressor(modelo)

        #Entrenamiento del modelo
        print("Entrenamiento del modelo.")
        #modelo.fit(x_train,y_train)
        wrapper.fit(train_input,train_output)


        #Predicciones
        print("Realizando las predicciones...")
        y_pred = wrapper.predict(test_input)
        pro.asignar_umbral(modelo_generico,test_output, y_pred)
        y_pred = pro.postprocesar(y_pred, modelo_generico.umbral_postprocesado)

        #Evaluar las métricas
        lista_metricas_DAO = Metrica.objects.filter(id_modelo_id = id).order_by("id")
        pro.asigna_valores_metricas_generico(lista_metricas_DAO, test_output, y_pred, id)

        modelo_generico.estado = "pendiente"
        modelo_generico.fecha_hora_fin = timezone.now()        
        modelo_generico.save()
        
        # ----------Guardar binario del modelo----------
        #Guardar modelo
        GestionModelos.almacenar_modelo(wrapper, modelo_generico)

        #Una vez que el entrenamiento finaliza, se envía un correo al Usuario
        correo_usuario = modelo_generico.creador.email
        print("Correo:", correo_usuario)
        gc.enviar_correo_modelo(modelo_generico, correo_usuario)


    @staticmethod
    def comparacion_modelos(nombre_usuario, lista_id_modelos, lista_metricas, id_dataset, postprocesar_flag):
        """Realiza la comparación de los modelos indicados en el parámetro lista_id_modelos.
        Para realizar la comparación utiliza las métricas indicadas en lista_metricas aplicadas
        sobre el dataset indicado mediante id_dataset.
        Devuelve una lista de los resultados obtenidos por cada modelo para cada métrica."""
        
        dict_modelos = dict() #Diccionario de diccionarios
        dict_cargados = dict() #Diccionario de modelos cargados
        dict_confusion = dict() #Diccionario de matrices de confusión
        
        test_output = numpy.array(Dataset.objects.get(id = id_dataset).obtiene_conductividades()).astype('float32')
        test_input = numpy.array(Dataset.objects.get(id = id_dataset).obtiene_voltajes()).astype('float32')

        for id_modelo in lista_id_modelos:
            dict_metricas = dict()
            modelo_cargado = GestionModelos.cargar_modelo(id_modelo, nombre_usuario)
            dict_cargados[id_modelo] = modelo_cargado
            pred_output = modelo_cargado.predict(test_input)
            if postprocesar_flag:
                print("POSTPROCESADO")
                pred_output = pro.postprocesar(pred_output, 15)

            #Calculo los valores de las métricas seleccionadas
            print("LAS MÉTRICAS SON:", lista_metricas)
            for m in lista_metricas:
                if (m == "mse" or m == "mean_squared_error"):
                    valor = round(metrics.mean_squared_error(test_output, pred_output), 4)
                elif(m == "mae" or m == "mean_absolute_error"):
                    valor = round(metrics.mean_absolute_error(test_output, pred_output), 4)
                elif(m == "msle" or m == "mean_squared_logarithmic_error"):
                    valor = round(metrics.mean_squared_log_error(test_output, abs(pred_output)), 4)
                elif(m == "accuracy"):
                    #m = "accuracy"
                    valor, mc = pro.porcentaje_acierto(id_modelo, test_output, pred_output)
                    valor = round(valor, 2)
                    dict_confusion[id_modelo] = mc

                dict_metricas[m] = valor

            dict_modelos[id_modelo] = dict_metricas #Añado el diccionario de métricas al diccionario de diccionarios

        return dict_modelos, dict_cargados, dict_confusion


