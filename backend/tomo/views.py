from rest_framework import generics
from django.shortcuts import render
from django.conf import settings
from django.db.models import Q
from django.core.files import File
from django.http import FileResponse

from .models import Dataset, Model, Neural_network_model, Random_forest_model, SVM_model, Metric
from .models import Mesh
from .serializers import DatasetSerializer, ModelSerializer, DNNSerializer, RFSerializer, SVMSerializer, MeshVoltagesSerializer, MeshConductivitiesSerializer
from .serializers import Matrix_confusionSerializer
from .permissions import IsCreatorOrOnlyRead, is_creator, is_creator_or_public

#from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import renderers
from rest_framework.parsers import FileUploadParser, MultiPartParser
from rest_framework.views import APIView
from rest_framework.exceptions import ParseError

from EIT_module.EITFacade import EITFacade as fi


import os
import ast
from datetime import datetime
from celery.task.control import revoke
import random

import logging

#In this file we define the services offered by the REST API.



############################Datasets############################
class ListDatasets(generics.ListAPIView):
    """It returns the list of datasets available to the user."""
    serializer_class = DatasetSerializer

    def get_queryset(self):
        datasets_list = Dataset.objects.filter(Q(visible = True, state = 'finished') | Q(creator = self.request.user), state = 'finished')
        return datasets_list



class GetDataset(generics.RetrieveUpdateDestroyAPIView):
    """It returns a specific dataset."""
    queryset = Dataset.objects.all()
    permission_classes = (IsCreatorOrOnlyRead, )
    serializer_class = DatasetSerializer

    def destroy(self, request, *args, **kwargs):
        dat = self.get_object()
        models = dat.model_set.all() #Models entrenados con el dataset

        if not models:
            dat.delete()
            return Response(status = status.HTTP_204_NO_CONTENT)
        else:
            return Response(status = status.HTTP_403_FORBIDDEN)



class ListGeneratingDatasets(generics.ListAPIView):
    """It returns the list of datasets in the process of being uploaded or generated."""
    serializer_class = DatasetSerializer

    def get_queryset(self):
        datasets_list = Dataset.objects.filter(~Q(state = "pending"), ~Q(state = "finished"), creator = self.request.user)
        return datasets_list




class ListPendingDatasets(generics.ListAPIView):
    """It returns the list of datasets that have already been uploaded/generated, but have not yet been saved by the user."""
    serializer_class = DatasetSerializer

    def get_queryset(self):
        datasets_list = Dataset.objects.filter(state = "pending", creator = self.request.user)
        return datasets_list





@api_view(['POST'])
def generate_dataset(request):
    """It generates a new datasets with the parameters specified by the user."""
    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset(creation_date = datetime.now(), min_radius = d['min_radius'], max_radius = d['max_radius'],
                            seed = d['seed'], creator = request.user, visible = d['visible'])
            dataset.save()
            tup_n = (int(d['n1']),int(d['n2']),int(d['n3']))
        except:
            return Response(status = status.HTTP_400_BAD_REQUEST)
        
        fi.initiate_dataset_task(dataset, tuple_n_meshes = tup_n)
        return Response(status = status.HTTP_200_OK)

    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)




@api_view(['GET'])
def prepare_dataset(request, pk):
    """It generates a dataset download file."""
    try:
        dataset = Dataset.objects.get(id = pk)
        if not is_creator_or_public(dataset, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET': 
        fi.generate_dataset_file(dataset.id, request.user.get_username())
        url_dataset = settings.URL_PUERTO + settings.MEDIA_URL + "datasets/" + "{}_dataset{}.csv".format(request.user.get_username(), pk)

        return Response({"url_dataset" : url_dataset}, status = status.HTTP_200_OK) 
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)





@api_view(['DELETE'])
def cancel_dataset_task(request, pk):
    """It cancels the upload or generation of a dataset.""" 
    try:
        dataset = Dataset.objects.get(id = pk)
        if not is_creator(dataset, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if dataset.state != "pending" and dataset.state != "finished":
            task_id = dataset.state
            revoke(task_id, terminate=True)
            dataset.delete()
        else:
            task_dataset_finalizada = True #Podría hacer algo con esto
        return Response(status = status.HTTP_204_NO_CONTENT)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)





class UploadDataset(APIView):
    """It inserts a dataset in the DB from the file uploaded by the user."""
    parser_classes = (MultiPartParser, )#(FileUploadParser,)#(MultiPartParser, )

    def post(self, request, format=None):
        try:
            d = request.data
            dataset = Dataset(creation_date = datetime.now(), min_radius = d['min_radius'], max_radius = d['max_radius'],
                            seed = d['seed'], creator = request.user, visible = d['visible'])
            dataset.save()
            f = request.data['file'] #Podría usar un bucle con chunks() para mayor seguridad.

        except Exception as e:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        try:
            fi.initiate_dataset_task(dataset, f)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except: #Incorrect structure file
            dataset.delete()
            return Response(status = status.HTTP_406_NOT_ACCEPTABLE) 







############################Models############################
class ListModels(generics.ListAPIView):
    """It returns the list of models available to the user."""
    serializer_class = ModelSerializer

    def get_queryset(self):
        #Si se introducen mal estos parámetros, simplemente se ignoran
        propio = self.request.query_params.get('propio')
        type = self.request.query_params.get('type')
        

        models_list = Model.objects.filter(Q(visible = True) | Q(creator = self.request.user), state = 'finished')
        
        if(propio is not None):
            
            models_list = models_list.filter(creator = self.request.user.get_username())
        
        

        if(type == "DNN" or type == "RF" or type == "SVM"):
            
            models_list = models_list.filter(type = type)
        
        return models_list



class ListTrainingModels(generics.ListAPIView):
    """It returns the list of models being trained."""
    serializer_class = ModelSerializer

    def get_queryset(self):
        list_trainings = Model.objects.filter(~Q(state = "pending"), ~Q(state = "finished"), creator = self.request.user)
        return list_trainings




class ListPendingModels(generics.ListAPIView):
    """It returns the list of models whose training has been completed, but not yet saved by the user."""
    serializer_class = ModelSerializer

    def get_queryset(self):
        list_pendings = Model.objects.filter(state = "pending", creator = self.request.user)
        return list_pendings





@api_view(['GET', 'DELETE', 'PATCH'])
def get_model(request, pk):
    """It returns a specific model."""
    
    try:
        
        generic_model = Model.objects.get(id = pk)
        if not is_creator_or_public(generic_model, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
        
        if generic_model.type == "DNN":
            specific_model = Neural_network_model.objects.get(id_model = pk)
        elif generic_model.type == "RF":
            specific_model = Random_forest_model.objects.get(id_model = pk)
        elif generic_model.type == "SVM":
            specific_model = SVM_model.objects.get(id_model = pk)
        else:
            print("Incorrect model type.")
            
    except:
        logging.exception("message")
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET': 
        model_gen_serializado = ModelSerializer(generic_model)
        
        
        if generic_model.type == "DNN":
            model_espec_serializado = DNNSerializer(specific_model)
        elif generic_model.type == "RF":
            model_espec_serializado = RFSerializer(specific_model)
        elif generic_model.type == "SVM":
            model_espec_serializado = SVMSerializer(specific_model)
        
        dict_respuesta = {'generic_model' : model_gen_serializado.data, 'specific_model' : model_espec_serializado.data}
        
        return Response(dict_respuesta) #Me falta especificar un status. No, devuelve por defecto 200

    elif request.method == "DELETE":
        if not is_creator(generic_model, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

        fi.remove_model_file(generic_model.id)
        generic_model.delete()
        return Response(status = status.HTTP_204_NO_CONTENT)
    
    elif request.method == "PATCH":
        if not is_creator(generic_model, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

        try:
            d = request.data
            
            generic_model.state = d['state']
            generic_model.save()
        except:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)






    
@api_view(['POST'])
def train_DNN(request):
    """It trains a DNN model."""

    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset.objects.get(id = d['dataset'])
            if not is_creator_or_public(dataset, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

            
            model = Model(type = "DNN",
                            comentaries = d['comentarios'],
                            creator = request.user, visible = d['visibilidad'], state = "entrenando", 
                            datetime_start = datetime.now(),
                            dataset = dataset)
            
            model_ANN = Neural_network_model(id_model = model, hidden_layers = d['n_hidden_layers'], neurons_per_layer = d['n_neuronas'],
                                            inside_activation_function = d['inside_activation_function'], outside_activation_function = d['outside_activation_function'],
                                            error_function = d['error_function'],
                                            epochs = d['n_epochs'], batch_size = d['batch_size'],
                                            learning_rate = d['learning_rate'],
                                            momentum = d['momentum'])
            
            model.save()
            model_ANN.save()
            for m in d['metrics']:
                met = Metric(id_model = model, name = m)
                met.save()
        except Exception as e:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        fi.train_model(model.id)
        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def train_RF(request):
    """It trains a Random Forest model."""

    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset.objects.get(id = d['dataset'])
            if not is_creator_or_public(dataset, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

            model = Model(type = "RF",
                            comentaries = d['comentarios'],
                            creator = request.user, visible = d['visibilidad'], state = "entrenando",
                            datetime_start = datetime.now(),
                            dataset = dataset)
            model_RF = Random_forest_model(id_model = model, n_estimators = d['n_estimators'], max_depth = d['max_depth'],
                                            min_samples_split = d['min_samples_split'], min_samples_leaf = d['min_samples_leaf'])

            model.save()
            model_RF.save()

            for m in d['metrics']:
                met = Metric(id_model = model, name = m)
                met.save()
        except Exception as e:
            
            return Response(status = status.HTTP_400_BAD_REQUEST)

        fi.train_model(model.id)
        
        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def train_SVM(request):
    """It trains a SVM model."""

    if request.method == 'POST':
        try:
            d = request.data
            dataset = Dataset.objects.get(id = d['dataset'])
            if not is_creator_or_public(dataset, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

            model = Model(type = "SVM",
                            comentaries = d['comentarios'],
                            creator = request.user, visible = d['visibilidad'], state = "entrenando",
                            datetime_start = datetime.now(),
                            dataset = dataset)
            model_SVM = SVM_model(id_model = model, kernel = d['kernel'], degree = d['degree'], gamma = d['gamma'],
                                            coef0 = d['coef0'], c = d['c'], epsilon = d['epsilon'], tol = d['tol'])

            model.save()
            model_SVM.save()

            for m in d['metrics']:
                met = Metric(id_model = model, name = m)
                met.save()
        except Exception as e:
            
            return Response(status = status.HTTP_400_BAD_REQUEST)

        fi.train_model(model.id)
        return Response(status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['DELETE'])
def cancel_training(request, pk):
    """It cancels a model training."""

    try:
        model = Model.objects.get(id = pk)
        if not is_creator(model, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if model.state != "pending" and model.state != "finished":
            task_id = model.state
            
            revoke(task_id, terminate=True)
            model.delete()
        else:
            training_finished = True #Podría hacer algo con esto
        return Response(status = status.HTTP_204_NO_CONTENT)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def compare_models(request):
    """It performs the comparison of the models indicated in the request."""

    try:
        list_id_models =  request.query_params.get('models_list') #Convierte el string en una list
        
        list_id_models = [int(x) for x in list_id_models.split(",")]
        list_id_models.sort()
        
        metrics_list =  request.query_params.get('metrics_list') #Quito los corchetes y creo una list de strings
        
        metrics_list = [x for x in metrics_list.split(",")]
        
        id_dataset = request.query_params.get('dataset')
        postprocessing = request.query_params.get('postprocessing')
        username = request.user.get_username()

        if postprocessing == "true":
            postprocessing = True
        else:
            postprocessing = False
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    dict_types = {}
    try: 
        for id_model in list_id_models:
            model = Model.objects.get(id = id_model)
            dict_types[id_model] = model.type
            if not is_creator_or_public(model, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

        dataset = Dataset.objects.get(id = id_dataset)
        
        if not is_creator_or_public(dataset, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)


    if request.method == 'GET': 
        dict_metrics, _, matrices_confusion = fi.compare_models(username, list_id_models, metrics_list, id_dataset, postprocessing)
        dict_respuesta = {}
        dict_respuesta['metrics'] = dict_metrics
        dict_respuesta['types'] = dict_types

        if 'accuracy' in metrics_list:
            dict_confusion = {}
            for k in matrices_confusion.keys(): #Serializo las matrices de confusion
                dict_confusion[k] = Matrix_confusionSerializer(matrices_confusion[k]).data
            dict_respuesta['matrices_confusion'] = dict_confusion

        return Response(dict_respuesta, status = status.HTTP_200_OK) #Me falta especificar un status
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)











###########################Meshes############################
class ListVoltages(generics.ListAPIView):
    """It returns a list of lists of voltages in the indicated range of meshes for a dataset."""

    serializer_class = MeshVoltagesSerializer

    def get_queryset(self):
        #Tengo que hacer algo si en la petición no se introducen estas opciones
        try:
            dataset = self.request.query_params.get('dataset')
            index_inicio = int(self.request.query_params.get('index_inicio'))
            index_fin = int(self.request.query_params.get('index_fin'))
            meshes_list_voltages = Mesh.objects.filter(dataset = dataset)[index_inicio:index_fin]

            dat = Dataset.objects.get(id = dataset)
            if not is_creator_or_public(dat, self.request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)
        except:
            raise ParseError(detail=None) #Devolverá message HTTP 400 BAD REQUEST
        return meshes_list_voltages




class ListConductivities(generics.ListAPIView):
    """It returns a list of lists of conductivities in the indicated range of meshes for a dataset."""
    serializer_class = MeshConductivitiesSerializer

    def get_queryset(self):
        #Tengo que hacer algo si en la petición no se introducen estas opciones
        try:
            dataset = self.request.query_params.get('dataset')
            n_art = int(self.request.query_params.get('number_artifacts'))
            index_inicio = int(self.request.query_params.get('index_inicio'))
            index_fin = int(self.request.query_params.get('index_fin'))
            meshes_list_conductivities = Mesh.objects.filter(dataset = dataset, number_artifacts = n_art)[index_inicio:index_fin]

            dat = Dataset.objects.get(id = dataset)
            if not is_creator_or_public(dat, self.request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)
        except:
            raise ParseError(detail=None)
        return meshes_list_conductivities
        



@api_view(['GET'])
def reconstruct_img(request):
    """It reconstructs the image of a mesh from a dataset (real y predicted)."""
    #Tengo que comprobar permisos para dataset y model
    try:
        dataset = int(request.query_params.get('dataset'))
        index = int(request.query_params.get('index'))
        model = int(request.query_params.get('model'))
        postprocessing = request.query_params.get('postprocessing')

        if postprocessing == "true":
            postprocessing = True
        else:
            postprocessing = False
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    try:
        dat = Dataset.objects.get(id = dataset)
        mod = Model.objects.get(id = model)
        m = Mesh.objects.get(dataset = dataset, index = index)

        if (not is_creator_or_public(dat, request.user)) or (not is_creator_or_public(mod, request.user)):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':  
        predicted_conductivities, marcas = fi.reconstruct_img(m.id, model, request.user.get_username(), postprocessing_flag = postprocessing)

        url_real = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "mesh1_{}_{}.png".format(request.user.get_username(), marcas[0])
        url_reconstructed = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "mesh2_{}_{}.png".format(request.user.get_username(), marcas[1])
        
        diccionario_urls = {'url_real' : url_real, 'url_reconstructed' : url_reconstructed, 'predicted_conductivities' : predicted_conductivities}
        
        return Response(diccionario_urls, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def generate_cut(request):
    """It generates the cut of a mesh at the indicated Y-axis value."""

    try:
        d = request.data
        dataset = int(d['dataset'])
        index = int(d['index'])
        y = float(d['y'])
        predicted_conductivities = [float(i) for i in d['conductivities']]
        
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    try:
        dat = Dataset.objects.get(id = dataset)
        if not is_creator_or_public(dat, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)

        m = Mesh.objects.get(dataset = dataset, index = index)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':      
        url_cut_aux = fi.cuts(m.id, predicted_conductivities, request.user.get_username(), y)
        url_cut = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + url_cut_aux
        diccionario_urls = {'cuts' : url_cut}

        return Response(diccionario_urls, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)




@api_view(['GET'])
def reconstruct_img_multiple(request):
    """I reconstructs the image of the same mesh with all the models indicated in the request."""
    try:
        list_id_models =  ast.literal_eval(request.query_params.get('models_list')) #Convierte el string en una list
        list_id_models = list(list_id_models)
        
        
        list_id_models.sort()
        
        mesh_index =  request.query_params.get('mesh_index')
        id_dataset = request.query_params.get('dataset')
        postprocessing = request.query_params.get('postprocessing')
        username = request.user.get_username()

        if postprocessing == "true":
            postprocessing = True
        else:
            postprocessing = False
    except Exception as e:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    try:
        for id_model in list_id_models:
            mod = Model.objects.get(id = id_model)
            if not is_creator_or_public(mod, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)

        dat = Dataset.objects.get(id = id_dataset)
        if not is_creator_or_public(dat, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET': 
        mesh_index, list_marcas = fi.reconstruct_img_several_models(list_id_models, username,id_dataset, mesh_index, postprocessing_flag = postprocessing)

        dict_urls = {}
        for i in range(len(list_id_models) + 1): #Añado una unidad para la image real
            clave_url = "url" + str(i)
            value_url = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "mesh{}_{}_{}.png".format(str(i), request.user.get_username(), list_marcas[i])
            dict_urls[clave_url] = value_url

        return Response(dict_urls, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def reconstruct_img_simple(request):
    """It reconstructs an image from the conductivities supplied in the request."""
    try:
        d = request.data
        id_model =  d['model']
        predicted_conductivities = [float(i) for i in d['conductivities']]
        
    except:
        return Response(status = status.HTTP_400_BAD_REQUEST)

    username = request.user.get_username()

    try:
        mod = Model.objects.get(id = id_model)
        if not is_creator_or_public(mod, request.user):
            return Response(status = status.HTTP_403_FORBIDDEN)
    except:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'POST': 
        _,marca = fi.reconstruct_img_single(predicted_conductivities, id_model, username)
        url_img = settings.URL_PUERTO + settings.MEDIA_URL + "images/" + "mesh1_{}_{}.png".format(username, marca)

        return Response({"url_img" : url_img}, status = status.HTTP_200_OK)
    else:
        return Response(status = status.HTTP_405_METHOD_NOT_ALLOWED)




class PredictConductivities(APIView):
    """It predicts the conductivities from the voltages of a voltage file supplied in the request."""
    parser_classes = (MultiPartParser, )

    def post(self, request, format=None):
        try:
            d = request.data
            f = request.data['file'] #Podría usar un bucle con chunks() para mayor seguridad.
        except:
            return Response(status = status.HTTP_400_BAD_REQUEST)

        try:
            mod = Model.objects.get(id = d['model'])
            if not is_creator_or_public(mod, request.user):
                return Response(status = status.HTTP_403_FORBIDDEN)
        except:
            return Response(status = status.HTTP_404_NOT_FOUND)

        try:
            voltages_reales, predicted_conductivities = fi.predict_conductivities(d['model'], f, request.user.get_username())
            return Response({'voltages_reales' : voltages_reales, 'predicted_conductivities' : predicted_conductivities})

        except: #Incorrect file structure
            return Response(status = status.HTTP_406_NOT_ACCEPTABLE) 



