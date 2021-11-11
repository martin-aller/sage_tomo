from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Dataset, Model, Neural_network_model, Random_forest_model, SVM_model, Metric, Confusion_matrix
from .models import Mesh
import tomo.views


#Serializers for the classes defined in models.py

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class DatasetSerializer(serializers.ModelSerializer):
    creator = UserSerializer(
        many=False,
        read_only=True,
    )
    class Meta:
        model = Dataset
        fields = ('id', 'creation_date', 'min_radius', 'max_radius', 'seed', 'creator', 'visible', 'state',
        'n_meshes', 'n_meshes_1', 'n_meshes_2', 'n_meshes_3')



class MetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = ('name', 'value')


class Matrix_confusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confusion_matrix
        fields = ('true_negatives', 'false_positives', 'false_negatives', 'true_positives')



class ModelSerializer(serializers.ModelSerializer):
    creator = UserSerializer(
        many=False,
        read_only=True,
    )

    metrics = MetricSerializer(
        many=True,
        read_only=True,
    )

    confusion_matrix = Matrix_confusionSerializer(
        many=False,
        read_only=True,
    )

    class Meta:
        model = Model
        fields = ('id','type','comentaries','creator','visible','state','dataset','postprocessing_threshold','datetime_start',
        'datetime_end', 'training_time', 'metrics', 'confusion_matrix')


class DNNSerializer(serializers.ModelSerializer):
    class Meta:
        model = Neural_network_model
        fields = ('id_model','hidden_layers','neurons_per_layer','inside_activation_function','outside_activation_function','error_function',
        'epochs','batch_size','learning_rate','momentum')



class RFSerializer(serializers.ModelSerializer):
    class Meta:
        model = Random_forest_model
        fields = ('id_model',  'n_estimators', 'max_depth', 'min_samples_split', 'min_samples_leaf', 'model_binary')


class SVMSerializer(serializers.ModelSerializer):
    class Meta:
        model = SVM_model
        fields = ('id_model', 'kernel','degree','gamma','coef0','tol','c','epsilon')



class MeshVoltagesSerializer(serializers.ModelSerializer):
    voltages = serializers.ListField(child=serializers.FloatField())

    class Meta:
        model = Mesh
        fields = ('id', 'index', 'number_artifacts', 'voltages')


class MeshConductivitiesSerializer(serializers.ModelSerializer):
    conductivities = serializers.ListField(child=serializers.FloatField())

    class Meta:
        model = Mesh
        fields = ('id', 'index', 'number_artifacts', 'conductivities')


