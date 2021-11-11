from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from math import ceil
import datetime
import random



#List of classes to map on the BD.



class Dataset(models.Model):
    #Automatically generated incremental identifier
    creation_date = models.DateTimeField()
    min_radius = models.IntegerField()
    max_radius = models.IntegerField()
    seed = models.IntegerField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    visible = models.BooleanField()
    state = models.CharField(max_length = 100, null = True)


    def get_meshes(self, n_art = -1): 
        """It returns the list of meshes from a dataset."""

        if n_art > 0:
            meshes_list = Mesh.objects.filter(dataset = self, number_artifacts = n_art).order_by("id")
        else:
            meshes_list = Mesh.objects.filter(dataset = self).order_by("id")

        return meshes_list



    def get_voltages(self, n_art = -1):
        """It returns the list of lists of voltages from a dataset."""

        meshes_list = Mesh.objects.filter(dataset = self).order_by("index")  
        list_voltages = [m.voltages for m in meshes_list]
        return list_voltages




    def get_conductivities(self, n_art = -1):
        """It returns the list of lists of conductivities from a dataset"""

        if(n_art <= 0):
            meshes_list = Mesh.objects.filter(dataset = self).order_by("index")   
        else:
            meshes_list = Mesh.objects.filter(dataset = self, number_artifacts = n_art).order_by("index")  

        list_conductivities = [m.conductivities for m in meshes_list]
        
        return list_conductivities



    def n_meshes(self):
        """It returns the number of meshes of a dataset."""
        n_meshes = Mesh.objects.filter(dataset = self).count()
        return (n_meshes)


    #We have to define three methods without arguments instead of only one, in order to use them in the serializers.
    def n_meshes_1(self):
        """It returns the number of 1-artifact meshes from a dataset."""
        n_meshes = Mesh.objects.filter(dataset = self, number_artifacts = 1).count()
        return (n_meshes)

    def n_meshes_2(self):
        """It returns the number of 2-artifact meshes from a dataset."""
        n_meshes = Mesh.objects.filter(dataset = self, number_artifacts = 2).count()
        return (n_meshes)

    def n_meshes_3(self):
        """It returns the number of 3-artifact meshes from a dataset."""
        n_meshes = Mesh.objects.filter(dataset = self, number_artifacts = 3).count()
        return (n_meshes)


    def get_sets(self, validacion = False):
        """It returns sets of training (70% of the meshes) and test (30% of the meshes). If the validation argument is True, 
        three sets are returned: training (70% of the meshes), validation (15% of the meshes) and test (15% of the meshes). 
        For each set, voltages and conductivities are returned separately."""

        len_train = ceil(0.7*self.n_meshes())
        #len_test = self.n_meshes() - len_train

        voltages = self.get_voltages() 
        random.Random(self.seed).shuffle(voltages)

        conductivities = self.get_conductivities()
        random.Random(self.seed).shuffle(conductivities)

        voltages_train = voltages[:len_train]
        conductivities_train = conductivities[:len_train]

        if not validacion:
            voltages_test = voltages[len_train:]
            conductivities_test = conductivities[len_train:]
            voltages_validacion = []
            conductivities_validacion = []
        else:
            len_restante = self.n_meshes() - len_train
            len_val = ceil(len_restante/2) 

            voltages_test = voltages[len_train:len_train + len_val]
            conductivities_test = conductivities[len_train:len_train + len_val]
            voltages_validacion = voltages[len_train + len_val:]
            conductivities_validacion = conductivities[len_train + len_val:]

        return voltages_train, conductivities_train, voltages_test, conductivities_test, voltages_validacion, conductivities_validacion

    class Meta:
        ordering = ("-id", )




class Mesh(models.Model):
    #Automatically generated incremental identifier
    index = models.IntegerField()
    number_artifacts = models.IntegerField()
    dataset = models.ForeignKey(Dataset, on_delete = models.CASCADE)
    voltages = ArrayField(models.FloatField())
    conductivities = ArrayField(models.FloatField())

    class Meta:
        unique_together = (("index", "dataset"),)
        ordering = ("index", )

class Model(models.Model):
    #Automatically generated incremental identifier
    type = models.CharField(max_length = 30)
    comentaries = models.CharField(max_length = 300, null = True, blank = True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    visible = models.BooleanField()
    state = models.CharField(max_length = 50, null = True)
    path_model = models.CharField(max_length = 300, null = True, blank = True)
    dataset = models.ForeignKey(Dataset, on_delete = models.PROTECT)
    postprocessing_threshold = models.FloatField(null = True)
    datetime_start = models.DateTimeField() #By default, set this value to datetime.now()
    datetime_end = models.DateTimeField(null = True)

    def training_time(self):
        """It returns the training time of a model."""

        if(self.datetime_end is None or self.datetime_start is None):
            return "No information."
        tiempo = self.datetime_end - self.datetime_start
        duracion = ""
        
        segundos = tiempo.seconds
        horas, s1 = divmod(segundos,3600)
        minutos, s2 = divmod(s1, 60)
        segundos = ceil(s2)
        
        duracion = str(horas) + " h, " + str(minutos) + " min, " + str(segundos) + " seg"

        return duracion
    
    class Meta:
        ordering = ("-id", )
    
    
class Neural_network_model(models.Model):
    id_model = models.OneToOneField(Model, primary_key = True, on_delete = models.CASCADE)
    hidden_layers = models.IntegerField()
    neurons_per_layer = ArrayField(models.IntegerField(), size = 10) 
    inside_activation_function = models.CharField(max_length = 30)
    outside_activation_function = models.CharField(max_length = 30)
    error_function = models.CharField(max_length = 30)
    epochs = models.IntegerField()
    batch_size = models.IntegerField(null = True)
    learning_rate = models.FloatField()
    momentum = models.FloatField()
    architecture_binary = models.BinaryField() 
    weights_binary = models.BinaryField()


class Random_forest_model(models.Model):
    id_model = models.OneToOneField(Model, primary_key = True, on_delete = models.CASCADE)
    n_estimators = models.IntegerField()
    max_depth = models.IntegerField() 
    min_samples_split = models.IntegerField() 
    min_samples_leaf = models.IntegerField() 
    model_binary = models.BinaryField()

class SVM_model(models.Model):
    id_model = models.OneToOneField(Model, primary_key = True, on_delete = models.CASCADE)
    kernel = models.CharField(max_length = 30)
    degree = models.IntegerField()
    gamma = models.CharField(max_length = 30)
    coef0 = models.FloatField()
    tol = models.FloatField()
    c = models.FloatField()
    epsilon =  models.FloatField()
    model_binary = models.BinaryField()



class Metric(models.Model):
    id_model = models.ForeignKey(Model, on_delete = models.CASCADE, related_name = "metrics")
    name = models.CharField(max_length = 100)
    value = models.FloatField(null = True)
    class Meta:
        unique_together = (("id_model", "name"),)



class Confusion_matrix(models.Model):
    model = models.OneToOneField(Model, primary_key = True, on_delete = models.CASCADE, related_name = "confusion_matrix")
    true_negatives = models.IntegerField()
    false_positives  = models.IntegerField()
    false_negatives  = models.IntegerField()
    true_positives =  models.IntegerField()




