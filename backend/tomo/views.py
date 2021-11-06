from rest_framework import generics
from django.shortcuts import render
from django.conf import settings
from django.db.models import Q
from django.core.files import File
from django.http import FileResponse

from .models import Dataset, Modelo, Modelo_red_neuronal, Modelo_random_forest, Modelo_maquina_soporte_vectorial, Metrica
from .models import Malla
from .serializers import DatasetSerializer, ModeloSerializer, DNNSerializer, RFSerializer, SVMSerializer, MallaVoltajesSerializer, MallaConductividadesSerializer
from .serializers import Matriz_confusionSerializer
from .permissions import EsCreadorOSoloLectura, es_creador, es_creador_o_publico

#from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import renderers
from rest_framework.parsers import FileUploadParser, MultiPartParser
from rest_framework.views import APIView
from rest_framework.exceptions import ParseError

from modulo_EIT.FachadaEIT import FachadaEIT as fi


import os
import ast
from datetime import datetime
from celery.task.control import revoke
import random

import logging

#En este fichero se definen los servicios ofrecidos por la API REST



############################Datasets############################
class ListDataset(generics.ListAPIView):
    """Devuelve la lista de datasets disponibles para el usuario."""
    serializer_class = DatasetSerializer

    def get_queryset(self):
        lista_datasets = Dataset.objects.filter(Q(visible = True, estado = 'finalizado') | Q(creador = self.request.user), estado = 'finalizado')
        return lista_datasets

class ObtieneDataset(generics.RetrieveUpdateDestroyAPIView):
    """Devuelve un dataset particular."""
    queryset = Dataset.objects.all()
    permission_classes = (EsCreadorOSoloLectura, )
    serializer_class = DatasetSerializer


    def destroy(self, request, *args, **kwargs):
        dat = self.get_object()
        modelos = dat.modelo_set.all() #Modelos entrenados con el dataset

        if not modelos:
            dat.delete()
            return Response(status = status.HTTP_204_NO_CONTENT)
        else:
            return Response(status = status.HTTP_403_FORBIDDEN)


class ListDatasetGenerando(generics.ListAPIView):
    """Devuelve la lista de datasets en proceso de ser subidos o generados."""
    serializer_class = DatasetSerializer

    def get_queryset(self):
        lista_datasets = Dataset.objects.filter(~Q(estado = "pendiente"), ~Q(estado = "finalizado"), creador = self.request.user)
        return lista_datasets



class ListDatasetPendiente(generics.ListAPIView):
    """Devuelve la lista de datasets que ya han sido subidos/generados, pero que aún no
    han sido guardados por el usuario."""
    serializer_class = DatasetSerializer

    def get_queryset(self):
        lista_datasets = Dataset.objects.filter(estado = "pendiente", creador = self.request.user)
        return lista_datasets





@api_view(['POST'])
def generar_dataset(request):
    """Genera un nuevo dataset."""
    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset(fecha_creacion = datetime.now(), r_min = d['r_min'], r_max = d['r_max'],
                            semilla = d['semilla'], creador = request.user, visible = d['visible'])
            dataset.save()
            tup_n = (int(d['n1']),int(d['n2']),int(d['n3']))
        except:
            return Response(status = status.HTTP_400_BAD_REQUEST)
        
        fi.iniciar_tarea_dataset(dataset, tupla_n_mallas = tup_n)
        return Response(status = status.HTTP_200_OK)

    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def preparar_dataset(request, pk):
    """Genera un fichero de descarga de un dataset."""
    try:
        dataset = Dataset.objects.get(id = pk)
        if not es_creador_o_publico(dataset, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET': 
        fi.generar_fichero_dataset(dataset.id, request.user.get_username())
        url_dataset = settings.URL_PUERTO + settings.MEDIA_URL + "datasets/" + "{}_dataset{}.csv".format(request.user.get_username(), pk)

        return Response({"url_dataset" : url_dataset}, status = status.HTTP_200_OK) 
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)





@api_view(['DELETE'])
def cancelar_tarea_dataset(request, pk):
    """Cancela la subida o generación de un dataset.""" 
    try:
        dataset = Dataset.objects.get(id = pk)
        if not es_creador(dataset, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if dataset.estado != "pendiente" and dataset.estado != "finalizado":
            tarea_id = dataset.estado
            revoke(tarea_id, terminate=True)
            dataset.delete()
        else:
            tarea_dataset_finalizada = True #Podría hacer algo con esto
        return Response(status = status.HTTP_204_NO_CONTENT)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)




class SubirDataset(APIView):
    """Inserta un dataset en la BD a partir del fichero subido por el usuario."""
    parser_classes = (MultiPartParser, )#(FileUploadParser,)#(MultiPartParser, )

    def post(self, request, format=None):
        try:

            d = request.data
            dataset = Dataset(fecha_creacion = datetime.now(), r_min = d['r_min'], r_max = d['r_max'],
                            semilla = d['semilla'], creador = request.user, visible = d['visible'])
            dataset.save()
            f = request.data['file'] #Podría usar un bucle con chunks() para mayor seguridad.

        except Exception as e:
            print(str(e))
            return Response(status = status.HTTP_400_BAD_REQUEST)

        try:
            fi.iniciar_tarea_dataset(dataset, f)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except: #En caso de que la estructura del fichero sea incorrecta.
            dataset.delete()
            return Response(status = status.HTTP_406_NOT_ACCEPTABLE) 
            #No sé si este código de error puedo usarlo para este tipo de situaciones
            #Creo que podría añadir un mensaje, indicando el error concreto






############################Modelos############################
class ListModelo(generics.ListAPIView):
    """Devuelve la lista de modelos están disponibles para el usuario."""
    serializer_class = ModeloSerializer

    def get_queryset(self):
        #Si se introducen mal estos parámetros, simplemente se ignoran
        propio = self.request.query_params.get('propio')
        tipo = self.request.query_params.get('tipo')
        print("INTERIOR:", propio)

        lista_modelos = Modelo.objects.filter(Q(visible = True) | Q(creador = self.request.user), estado = 'finalizado')
        print("longitud_inicial:", len(lista_modelos))
        if(propio is not None):
            print("PROPIO")
            lista_modelos = lista_modelos.filter(creador = self.request.user.get_username())
        
        print("TIPO FUERA:", tipo)

        if(tipo == "DNN" or tipo == "RF" or tipo == "SVM"):
            print("TIPO:", tipo)
            lista_modelos = lista_modelos.filter(tipo = tipo)
        print("LONGITUD:", len(lista_modelos))
        return lista_modelos

class ListModeloEntrenando(generics.ListAPIView):
    """Devuelve la lista de modelos en entrenamiento."""
    serializer_class = ModeloSerializer

    def get_queryset(self):
        lista_entrenamientos = Modelo.objects.filter(~Q(estado = "pendiente"), ~Q(estado = "finalizado"), creador = self.request.user)
        return lista_entrenamientos

class ListModeloPendiente(generics.ListAPIView):
    """Devuelve la lista de modelos cuyo entrenamiento ha finalizado, pero todavía no han sido
    guardados por el usuario."""
    serializer_class = ModeloSerializer

    def get_queryset(self):
        lista_pendientes = Modelo.objects.filter(estado = "pendiente", creador = self.request.user)
        return lista_pendientes


@api_view(['GET', 'DELETE', 'PATCH'])
def obtiene_modelo(request, pk):
    """Devuelve un modelo particular."""
    print("----------a----------")
    try:
        print("----------b----------")
        modelo_generico = Modelo.objects.get(id = pk)
        if not es_creador_o_publico(modelo_generico, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
        print("----------c----------")
        if modelo_generico.tipo == "DNN":
            modelo_especifico = Modelo_red_neuronal.objects.get(id_modelo = pk)
        elif modelo_generico.tipo == "RF":
            modelo_especifico = Modelo_random_forest.objects.get(id_modelo = pk)
        elif modelo_generico.tipo == "SVM":
            modelo_especifico = Modelo_maquina_soporte_vectorial.objects.get(id_modelo = pk)
        else:
            print("----------d----------")
    except:
        logging.exception("message")
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET': 
        modelo_gen_serializado = ModeloSerializer(modelo_generico)
        
        
        if modelo_generico.tipo == "DNN":
            modelo_espec_serializado = DNNSerializer(modelo_especifico)
        elif modelo_generico.tipo == "RF":
            modelo_espec_serializado = RFSerializer(modelo_especifico)
        elif modelo_generico.tipo == "SVM":
            modelo_espec_serializado = SVMSerializer(modelo_especifico)
        
        dict_respuesta = {'modelo_generico' : modelo_gen_serializado.data, 'modelo_especifico' : modelo_espec_serializado.data}
        print("TIPO:", type(modelo_gen_serializado.data))
        return Response(dict_respuesta) #Me falta especificar un status. No, devuelve por defecto 200

    elif request.method == "DELETE":
        if not es_creador(modelo_generico, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

        fi.eliminar_fichero_modelo(modelo_generico.id)
        modelo_generico.delete()
        return Response(status = status.HTTP_204_NO_CONTENT)
    
    elif request.method == "PATCH":
        if not es_creador(modelo_generico, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

        try:
            d = request.data
            print("PAAAATCH:", d)
            modelo_generico.estado = d['estado']
            modelo_generico.save()
        except:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)




    
@api_view(['POST'])
def entrenar_DNN(request):
    """Entrena un modelo de tipo DNN"""

    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset.objects.get(id = d['dataset'])
            if not es_creador_o_publico(dataset, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

            print("Hola1")
            modelo = Modelo(tipo = "DNN",
                            comentarios_adicionales = d['comentarios'],
                            creador = request.user, visible = d['visibilidad'], estado = "entrenando", 
                            fecha_hora_inicio = datetime.now(),
                            dataset = dataset)
            print("Hola2")
            print(d['n_neuronas'])
            #print("Problema:", d.getlist('n_neuronas'))
            modelo_ANN = Modelo_red_neuronal(id_modelo = modelo, capas_ocultas = d['n_capas_ocultas'], neuronas_por_capa = d['n_neuronas'],
                                            funcion_activacion_interna = d['funcion_activacion_interna'], funcion_activacion_salida = d['funcion_activacion_salida'],
                                            funcion_error = d['funcion_error'],
                                            epocas = d['n_epocas'], lotes = d['tamanho_lotes'],
                                            learning_rate = d['learning_rate'],
                                            momentum = d['momentum'])
            print("Hola 3")
            modelo.save()
            modelo_ANN.save()
            for m in d['metricas']:
                met = Metrica(id_modelo = modelo, nombre_metrica = m)
                met.save()
        except Exception as e:
            print(str(e))
            return Response(status = status.HTTP_400_BAD_REQUEST)

        fi.entrenar_modelo(modelo.id)

        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def entrenar_RF(request):
    """Entrena un modelo de tipo Random Forest"""

    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset.objects.get(id = d['dataset'])
            if not es_creador_o_publico(dataset, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

            modelo = Modelo(tipo = "RF",
                            comentarios_adicionales = d['comentarios'],
                            creador = request.user, visible = d['visibilidad'], estado = "entrenando",
                            fecha_hora_inicio = datetime.now(),
                            dataset = dataset)
            modelo_RF = Modelo_random_forest(id_modelo = modelo, n_estimadores = d['n_estimadores'], profundidad_max = d['profundidad_max'],
                                            min_samples_split = d['min_samples_split'], min_samples_leaf = d['min_samples_leaf'])

            modelo.save()
            modelo_RF.save()

            for m in d['metricas']:
                met = Metrica(id_modelo = modelo, nombre_metrica = m)
                met.save()
        except Exception as e:
            print(str(e))
            return Response(status = status.HTTP_400_BAD_REQUEST)

        fi.entrenar_modelo(modelo.id)
        
        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def entrenar_SVM(request):
    """Entrena un modelo de tipo SVM"""

    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset.objects.get(id = d['dataset'])
            if not es_creador_o_publico(dataset, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

            modelo = Modelo(tipo = "SVM",
                            comentarios_adicionales = d['comentarios'],
                            creador = request.user, visible = d['visibilidad'], estado = "entrenando",
                            fecha_hora_inicio = datetime.now(),
                            dataset = dataset)
            modelo_SVM = Modelo_maquina_soporte_vectorial(id_modelo = modelo, kernel = d['kernel'], grado = d['grado'], gamma = d['gamma'],
                                            coef0 = d['coef0'], c = d['c'], epsilon = d['epsilon'], tol = d['tol'])

            modelo.save()
            modelo_SVM.save()

            for m in d['metricas']:
                met = Metrica(id_modelo = modelo, nombre_metrica = m)
                met.save()
        except Exception as e:
            print(str(e))
            return Response(status = status.HTTP_400_BAD_REQUEST)

        fi.entrenar_modelo(modelo.id)
        
        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['DELETE'])
def cancelar_entrenamiento(request, pk):
    """Cancela el entrenamiento de un modelo."""

    try:
        modelo = Modelo.objects.get(id = pk)
        if not es_creador(modelo, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':

        if modelo.estado != "pendiente" and modelo.estado != "finalizado":
            tarea_id = modelo.estado
            print("Estado:", tarea_id)
            revoke(tarea_id, terminate=True)
            modelo.delete()
        else:
            print("bbb")
            entrenamiento_finalizado = True #Podría hacer algo con esto
        return Response(status = status.HTTP_204_NO_CONTENT)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def comparar_modelos(request):
    """Realiza la comparación de los modelos indicados en la petición."""

    try:
        lista_id_modelos =  request.query_params.get('lista_modelos') #Convierte el string en una lista
        print("L: ", lista_id_modelos, " TIPO: ", type(lista_id_modelos))
        lista_id_modelos = [int(x) for x in lista_id_modelos.split(",")]
        lista_id_modelos.sort()
        print("a")
        lista_metricas =  request.query_params.get('lista_metricas') #Quito los corchetes y creo una lista de strings
        print("b")
        lista_metricas = [x for x in lista_metricas.split(",")]
        print("c")
        id_dataset = request.query_params.get('dataset')
        postprocesar = request.query_params.get('postprocesar')
        nombre_usuario = request.user.get_username()

        if postprocesar == "true":
            postprocesar = True
        else:
            postprocesar = False
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    dict_tipos = {}
    try:
        print("Modelos:", lista_id_modelos)
        print("Tipo: ", type(lista_id_modelos))
        for id_modelo in lista_id_modelos:
            modelo = Modelo.objects.get(id = id_modelo)
            dict_tipos[id_modelo] = modelo.tipo
            if not es_creador_o_publico(modelo, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

        print("Dataset")
        dataset = Dataset.objects.get(id = id_dataset)
        print("Fin dataset")
        if not es_creador_o_publico(dataset, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)


    if request.method == 'GET': 
        dict_metricas, _, matrices_confusion = fi.comparacion_modelos(nombre_usuario, lista_id_modelos, lista_metricas, id_dataset, postprocesar)
        dict_respuesta = {}
        dict_respuesta['metricas'] = dict_metricas
        dict_respuesta['tipos'] = dict_tipos

        if 'accuracy' in lista_metricas:
            dict_confusion = {}
            for k in matrices_confusion.keys(): #Serializo las matrices de confusion
                dict_confusion[k] = Matriz_confusionSerializer(matrices_confusion[k]).data
            dict_respuesta['matrices_confusion'] = dict_confusion

        return Response(dict_respuesta, status = status.HTTP_200_OK) #Me falta especificar un status
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)











###########################Mallas############################
class ListVoltaje(generics.ListAPIView):
    """Devuelve la lista de voltajes del rango de mallas indicado para un dataset."""

    serializer_class = MallaVoltajesSerializer

    def get_queryset(self):
        #Tengo que hacer algo si en la petición no se introducen estas opciones
        try:
            dataset = self.request.query_params.get('dataset')
            indice_inicio = int(self.request.query_params.get('indice_inicio'))
            indice_fin = int(self.request.query_params.get('indice_fin'))
            lista_mallas_voltajes = Malla.objects.filter(dataset = dataset)[indice_inicio:indice_fin]

            dat = Dataset.objects.get(id = dataset)
            if not es_creador_o_publico(dat, self.request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)
        except:
            raise ParseError(detail=None) #Devolverá mensaje HTTP 400 BAD REQUEST
        return lista_mallas_voltajes


class ListConductividad(generics.ListAPIView):
    """Devuelve la lista de conductividades del rango de mallas indicado para un dataset."""
    serializer_class = MallaConductividadesSerializer

    def get_queryset(self):
        #Tengo que hacer algo si en la petición no se introducen estas opciones
        try:
            dataset = self.request.query_params.get('dataset')
            n_art = int(self.request.query_params.get('numero_artefactos'))
            indice_inicio = int(self.request.query_params.get('indice_inicio'))
            indice_fin = int(self.request.query_params.get('indice_fin'))
            lista_mallas_conductividades = Malla.objects.filter(dataset = dataset, numero_artefactos = n_art)[indice_inicio:indice_fin]

            dat = Dataset.objects.get(id = dataset)
            if not es_creador_o_publico(dat, self.request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)
        except:
            raise ParseError(detail=None)
        return lista_mallas_conductividades
        

@api_view(['GET'])
def reconstruir_img(request):
    """Reconstruye la imagen de un dataset (real y predicha)."""
    #Tengo que comprobar permisos para dataset y modelo
    try:
        dataset = int(request.query_params.get('dataset'))
        indice = int(request.query_params.get('indice'))
        modelo = int(request.query_params.get('modelo'))
        postprocesar = request.query_params.get('postprocesar')

        if postprocesar == "true":
            postprocesar = True
        else:
            postprocesar = False
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    try:
        dat = Dataset.objects.get(id = dataset)
        mod = Modelo.objects.get(id = modelo)
        m = Malla.objects.get(dataset = dataset, indice = indice)

        if (not es_creador_o_publico(dat, request.user)) or (not es_creador_o_publico(mod, request.user)):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':  

        conductividades_predichas, marcas = fi.reconstruir_img(m.id, modelo, request.user.get_username(), postprocesado_flag = postprocesar)

        url_real = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "malla1_{}_{}.png".format(request.user.get_username(), marcas[0])
        url_reconstruida = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "malla2_{}_{}.png".format(request.user.get_username(), marcas[1])
        

        diccionario_urls = {'url_real' : url_real, 'url_reconstruida' : url_reconstruida, 'conductividades_predichas' : conductividades_predichas}
        return Response(diccionario_urls, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def genera_corte(request):
    """Genera el corte de una malla en el valor del eje Y indicado."""
    #Tengo que comprobar permisos para dataset y modelo
    try:
        d = request.data
        dataset = int(d['dataset'])
        indice = int(d['indice'])
        y = float(d['y'])
        print("Y: ", y)
        print("A1");
        conductividades_predichas = [float(i) for i in d['conductividades']]
        print("A2")
        
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    try:
        dat = Dataset.objects.get(id = dataset)
        if not es_creador_o_publico(dat, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

        m = Malla.objects.get(dataset = dataset, indice = indice)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':      
        url_corte_aux = fi.cortes(m.id, conductividades_predichas, request.user.get_username(), y)

        url_corte = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + url_corte_aux

        diccionario_urls = {'cortes' : url_corte}
        return Response(diccionario_urls, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
def reconstruir_img_multiple(request):
    """Reconstruye la imagen de una misma malla con todos los modelos indicados en la petición."""
    try:
        lista_id_modelos =  ast.literal_eval(request.query_params.get('lista_modelos')) #Convierte el string en una lista
        lista_id_modelos = list(lista_id_modelos)
        print("IBAMOS BIEN")
        print("TIPO PIK:", type(lista_id_modelos))
        lista_id_modelos.sort()
        print("AUN MEJOR")
        indice_malla =  request.query_params.get('indice_malla')
        id_dataset = request.query_params.get('dataset')
        postprocesar = request.query_params.get('postprocesar')
        nombre_usuario = request.user.get_username()

        if postprocesar == "true":
            postprocesar = True
        else:
            postprocesar = False
    except Exception as e:
        print(str(e))
        return Response(status = status.HTTP_400_BAD_REQUEST)

    try:
        for id_modelo in lista_id_modelos:
            mod = Modelo.objects.get(id = id_modelo)
            if not es_creador_o_publico(mod, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

        dat = Dataset.objects.get(id = id_dataset)
        if not es_creador_o_publico(dat, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET': 
        indice_malla, lista_marcas = fi.reconstruir_img_varios_modelos(lista_id_modelos, nombre_usuario,id_dataset, indice_malla, postprocesado_flag = postprocesar)

        dict_urls = {}
        for i in range(len(lista_id_modelos) + 1): #Añado una unidad para la imagen real
            clave_url = "url" + str(i)
            valor_url = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "malla{}_{}_{}.png".format(str(i), request.user.get_username(), lista_marcas[i])
            dict_urls[clave_url] = valor_url

        print("DICCIONARIO URLS:", dict_urls)

        return Response(dict_urls, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def reconstruir_img_simple(request):
    """Reconstruye una imagen a partir de las conductividades suministradas en la petición."""
    try:
        print("A")
        d = request.data
        print("B")
        id_modelo =  d['modelo']
        conductividades_predichas = [float(i) for i in d['conductividades']]
        print("C")
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    nombre_usuario = request.user.get_username()

    try:
        mod = Modelo.objects.get(id = id_modelo)
        if not es_creador_o_publico(mod, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'POST': 
        _,marca = fi.reconstruir_img_individual(conductividades_predichas, id_modelo, nombre_usuario)
        url_img = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "malla1_{}_{}.png".format(nombre_usuario, marca)

        return Response({"url_img" : url_img}, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)




class PredecirConductividades(APIView):
    """Predice las conductividades a partir de los voltajes de un fichero de voltajes suministrado
    en la petición."""
    parser_classes = (MultiPartParser, )

    def post(self, request, format=None):
        try:
            d = request.data
            f = request.data['file'] #Podría usar un bucle con chunks() para mayor seguridad.
        except:
            return Response(status = status.HTTP_400_BAD_REQUEST)


        try:
            mod = Modelo.objects.get(id = d['modelo'])
            if not es_creador_o_publico(mod, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)
        except:
            return Response(status = status.HTTP_404_NOT_FOUND)

        try:
            print("ANTESSSS.")
            voltajes_reales, conductividades_predichas = fi.predecir_conductividades(d['modelo'], f, request.user.get_username())
            print("HASTA AQUÍ LLEGA CORRECTAMENTE.")
            return Response({'voltajes_reales' : voltajes_reales, 'conductividades_predichas' : conductividades_predichas})

        except: #En caso de que la estructura del fichero sea incorrecta.
            return Response(status = status.HTTP_406_NOT_ACCEPTABLE) 
            #No sé si este código de error puedo usarlo para este tipo de situaciones
            #Creo que podría añadir un mensaje, indicando el error concreto


