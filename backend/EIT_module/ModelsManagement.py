from tensorflow.keras import models,layers,Input,Model,optimizers,losses
from tensorflow.keras.utils import plot_model
from tensorflow.keras.models import model_from_json
#from keras import backend as K

from sklearn.ensemble import RandomForestRegressor
from sklearn import svm
from sklearn.multioutput import MultiOutputRegressor
from sklearn import metrics

from tomo.models import  Dataset
from tomo.models import Model, Neural_network_model, Random_forest_model, SVM_model, Metric
from django.utils import timezone

import os
import joblib
import numpy


from .FilesManagement import FilesManagement as gf
from .DataProcessing import Processing as pro
from .EmailsManagement import EmailsManagement as gc
from celery import shared_task

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '1' #Para que TensorFlow imprima sólo los errores en lugar de todos los messages de log.

#K.clear_session()


class ModelsManagement:

    @staticmethod
    def load_model(id_model_selected, username):
        '''
        Loads the model whose ID is the one specified in the first argument and returns 
        an object with the loaded file.
        '''

        type_model = Model.objects.get(id = id_model_selected).type

        if (type_model == 'DNN'):
            #Load DNN architecture 
            path_json = gf.build_path_model(id_model_selected) + ".json"
            path_h5 = gf.build_path_model(id_model_selected) + ".h5"

            json_file = open(path_json, 'r')
            loaded_model_json = json_file.read()
            json_file.close()
            loaded_model = model_from_json(loaded_model_json)

            #Load DNN weights
            loaded_model.load_weights(path_h5)

        else:
            path_model = gf.build_path_model(id_model_selected) + ".joblib"
            loaded_model = joblib.load(path_model)

        return loaded_model




    @staticmethod
    def store_model(model_entrenado, generic_model):
        '''
        It stores the trained model in the system.
        '''
        if (generic_model.type == "DNN"):
            model_json = model_entrenado.to_json()
            path_definitivo_json = gf.build_path_model(generic_model.id) + ".json"
            path_definitivo_h5 = gf.build_path_model(generic_model.id) + ".h5"
            
            with open(path_definitivo_json, "w") as json_file:
                json_file.write(model_json)

            model_entrenado.save_weights(path_definitivo_h5)

        else:
            path_model = gf.build_path_model(generic_model.id) + ".joblib" #REVISAR
            joblib.dump(model_entrenado, open(path_model, 'wb'))





    @staticmethod
    def train_model(id):
        model = Model.objects.get(id = id)

        if (model.type == 'DNN'):
            task = ModelsManagement.train_neural_network.delay(id)
        elif (model.type == 'RF'):
            task =ModelsManagement.train_random_forest.delay(id)
        elif(model.type == 'SVM'):
            task = ModelsManagement.train_svm.delay(id)

        model.state = str(task.id)
        model.save()




    @staticmethod
    @shared_task
    def train_neural_network(id):
        """It trains and stores a neural network."""

        model = Model.objects.get(id = id)
        model_ann = Neural_network_model.objects.get(id_model = id)
        
        train_input, train_output, test_input, test_output, validation_input, validation_output = model.dataset.get_sets(validacion = True)
        
        
        train_input = numpy.array(train_input).astype('float32')
        train_output = numpy.array(train_output).astype('float32')
        test_input = numpy.array(test_input).astype('float32')
        test_output = numpy.array(test_output).astype('float32')
        validation_input = numpy.array(validation_input).astype('float32')
        validation_output = numpy.array(validation_output).astype('float32')


        # # ----------Model definition----------
        
        model_tf = models.Sequential()
        model_tf.add(layers.Dense(model_ann.neurons_per_layer[0], input_dim=208))
        model_tf.add(layers.Activation(model_ann.inside_activation_function))

        if (model_ann.hidden_layers > 1):
            for n in model_ann.neurons_per_layer[1:]: #First element is not used
                model_tf.add(layers.Dense(n))
                model_tf.add(layers.Activation(model_ann.inside_activation_function))
        
        model_tf.add(layers.Dense(844))
        model_tf.add(layers.Activation(model_ann.outside_activation_function))
        
        metrics_list_DAO = Metric.objects.filter(id_model = id).order_by("id")
        metrics_list = pro.get_values(metrics_list_DAO.values("name"))
        
        if "acierto" in metrics_list:
            metrics_list.remove("acierto")

        # ----------Compile model----------
        model_tf.compile(optimizer = optimizers.RMSprop(lr = model_ann.learning_rate,
                                                        momentum = model_ann.momentum),
                    loss = model_ann.error_function,
                    metrics =  metrics_list)
        

        # ----------Fit model with training data----------
        
        if model_ann.batch_size != None:
            batch_size = model_ann.batch_size
        else:
            batch_size = len(train_input)
        history = model_tf.fit(train_input, train_output,
                            batch_size = batch_size,
                            epochs = model_ann.epochs,
                            validation_data=(validation_input, validation_output))

        # ----------Evaluate model with test set----------
        
        pred_output = model_tf.predict(test_input)
        pro.assign_threshold(model,test_output, pred_output)
        pred_output = pro.postprocessing(pred_output, model.postprocessing_threshold)
        pro.assign_values_metrics_generic(metrics_list_DAO, test_output, pred_output, id_model = id)
    
        # ----------Save architecture in JSON and weights in H5----------
        ModelsManagement.store_model(model_tf, model)
        
        model.state = "pending"
        model.datetime_end = timezone.now()
        model.save() #Necessary after having assigning a threshold
        model_ann.save()
        
        #Once training finishes, we send an email to the user
        email_usuario = Model.objects.get(id = id).creator.email
        
        gc.send_email_model(model, email_usuario)



    @staticmethod
    @shared_task
    def train_random_forest(id):
        """It trains and stores a Random Forest."""

        generic_model = Model.objects.get(id = id)
        model_ad = Random_forest_model.objects.get(id_model = id)

        train_input, train_output, test_input, test_output, _, _ = generic_model.dataset.get_sets()

        train_input = numpy.array(train_input).astype('float32')
        train_output = numpy.array(train_output).astype('float32')

        test_input = numpy.array(test_input).astype('float32')
        test_output = numpy.array(test_output).astype('float32')

        
        # ----------Model definition----------
        
        model = RandomForestRegressor(n_estimators = model_ad.n_estimators, random_state=0)

        # ----------Model training----------
        
        model.fit(train_input,train_output)


        # ----------Model evaluation with test set---------
        
        pred_output = model.predict(test_input)
        pro.assign_threshold(generic_model,test_output, pred_output)
        pred_output = pro.postprocessing(pred_output, generic_model.postprocessing_threshold)
        metrics_list_DAO = Metric.objects.filter(id_model = id).order_by("id")
        pro.assign_values_metrics_generic(metrics_list_DAO, test_output, pred_output, id_model = id)

        # ----------Save model binary----------
        ModelsManagement.store_model(model, generic_model)
        generic_model.state = "pending"
        generic_model.datetime_end = timezone.now()
        generic_model.save()

        #Once the training has finished, we send an email to the user
        email_usuario = generic_model.creator.email
        
        gc.send_email_model(generic_model, email_usuario)


    @staticmethod
    @shared_task
    def train_svm(id):
        """It trains and stores a SVM"""

        generic_model = Model.objects.get(id = id)

        train_input, train_output, test_input, test_output, _, _ = generic_model.dataset.get_sets()

        train_input = numpy.array(train_input).astype('float32')
        train_output = numpy.array(train_output).astype('float32')

        test_input = numpy.array(test_input).astype('float32')
        test_output = numpy.array(test_output).astype('float32')

        #Model definition
        
        model = svm.SVR(kernel='rbf', degree = 3, gamma = "auto", coef0 = 100, tol=7, C = 1200000.0, epsilon = 0.1) #x,y = 100 ---> MSE = 1780.18 #x,y = 1000 ---> MSE = 1098.85

        wrapper = MultiOutputRegressor(model)

        #Model training
        
        wrapper.fit(train_input,train_output)


        #Predictions

        y_pred = wrapper.predict(test_input)
        pro.assign_threshold(generic_model,test_output, y_pred)
        y_pred = pro.postprocessing(y_pred, generic_model.postprocessing_threshold)

        #Evaluation of metrics
        metrics_list_DAO = Metric.objects.filter(id_model = id).order_by("id")
        pro.assign_values_metrics_generic(metrics_list_DAO, test_output, y_pred, id)

        generic_model.state = "pending"
        generic_model.datetime_end = timezone.now()        
        generic_model.save()
        
        # ----------Save model binary----------
        #Save model
        ModelsManagement.store_model(wrapper, generic_model)

        #Once the training has finished, we send an email to the user
        email_usuario = generic_model.creator.email
        
        gc.send_email_model(generic_model, email_usuario)


    @staticmethod
    def compare_models(username, list_id_models, metrics_list, id_dataset, postprocessing_flag):
        """Performs the comparison of the models indicated in the parameter list_id_models. To perform the comparison 
        it uses the metrics indicated in metric_list applied on the dataset indicated by id_dataset. It returns a list of 
        the results obtained by each model for each metric."""
        
        dict_models = dict() #Dictionary of dictionaries
        dict_loaddos = dict() #Dictionary of loaded models
        dict_confusion = dict() #Dictionary of confusion matrices
        
        test_output = numpy.array(Dataset.objects.get(id = id_dataset).get_conductivities()).astype('float32')
        test_input = numpy.array(Dataset.objects.get(id = id_dataset).get_voltages()).astype('float32')

        for id_model in list_id_models:
            dict_metrics = dict()
            model_loaddo = ModelsManagement.load_model(id_model, username)
            dict_loaddos[id_model] = model_loaddo
            pred_output = model_loaddo.predict(test_input)
            if postprocessing_flag:
                
                pred_output = pro.postprocessing(pred_output, 15)

            #Calculate values for the selected metrics
            
            for m in metrics_list:
                if (m == "mse" or m == "mean_squared_error"):
                    value = round(metrics.mean_squared_error(test_output, pred_output), 4)
                elif(m == "mae" or m == "mean_absolute_error"):
                    value = round(metrics.mean_absolute_error(test_output, pred_output), 4)
                elif(m == "msle" or m == "mean_squared_logarithmic_error"):
                    value = round(metrics.mean_squared_log_error(test_output, abs(pred_output)), 4)
                elif(m == "accuracy"):
                    value, mc = pro.accuracy_percentage(id_model, test_output, pred_output)
                    value = round(value, 2)
                    dict_confusion[id_model] = mc

                dict_metrics[m] = value

            dict_models[id_model] = dict_metrics #Añado el diccionario de métricas al diccionario de diccionarios

        return dict_models, dict_loaddos, dict_confusion


