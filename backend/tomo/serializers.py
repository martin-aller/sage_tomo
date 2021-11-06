from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Dataset, Modelo, Modelo_red_neuronal, Modelo_random_forest, Modelo_maquina_soporte_vectorial, Metrica, Matriz_confusion
from .models import Malla
import tomo.views


#Serializadores de las clases definidas en models.py

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class DatasetSerializer(serializers.ModelSerializer):
    creador = UserSerializer(
        many=False,
        read_only=True,
    )
    class Meta:
        model = Dataset
        fields = ('id', 'fecha_creacion', 'r_min', 'r_max', 'semilla', 'creador', 'visible', 'estado',
        'n_mallas', 'n_mallas_1', 'n_mallas_2', 'n_mallas_3')



class MetricaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metrica
        fields = ('nombre_metrica', 'valor_metrica')


class Matriz_confusionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matriz_confusion
        fields = ('verdaderos_negativos', 'falsos_positivos', 'falsos_negativos', 'verdaderos_positivos')



class ModeloSerializer(serializers.ModelSerializer):
    creador = UserSerializer(
        many=False,
        read_only=True,
    )

    metricas = MetricaSerializer(
        many=True,
        read_only=True,
    )

    matriz_confusion = Matriz_confusionSerializer(
        many=False,
        read_only=True,
    )

    class Meta:
        model = Modelo
        fields = ('id','tipo','comentarios_adicionales','creador','visible','estado','dataset','umbral_postprocesado','fecha_hora_inicio',
        'fecha_hora_fin', 'tiempo_entrenamiento', 'metricas', 'matriz_confusion')

#A los modelos específicos podría quitarles el field 'id_modelo'
class DNNSerializer(serializers.ModelSerializer):
    # id_modelo = ModeloSerializer(
    #     many=False,
    #     read_only=True,
    # )
    class Meta:
        model = Modelo_red_neuronal
        fields = ('id_modelo','capas_ocultas','neuronas_por_capa','funcion_activacion_interna','funcion_activacion_salida','funcion_error',
        'epocas','lotes','learning_rate','momentum')



class RFSerializer(serializers.ModelSerializer):
    # id_modelo = ModeloSerializer(
    #     many=False,
    #     read_only=True,
    # )
    class Meta:
        model = Modelo_random_forest
        fields = ('id_modelo',  'n_estimadores', 'profundidad_max', 'min_samples_split', 'min_samples_leaf', 'binario_modelo')


class SVMSerializer(serializers.ModelSerializer):
    # id_modelo = ModeloSerializer(
    #     many=False,
    #     read_only=True,
    # )
    class Meta:
        model = Modelo_maquina_soporte_vectorial
        fields = ('id_modelo', 'kernel','grado','gamma','coef0','tol','c','epsilon')



class MallaVoltajesSerializer(serializers.ModelSerializer):
    voltajes = serializers.ListField(child=serializers.FloatField())

    class Meta:
        model = Malla
        fields = ('id', 'indice', 'numero_artefactos', 'voltajes')


class MallaConductividadesSerializer(serializers.ModelSerializer):
    conductividades = serializers.ListField(child=serializers.FloatField())

    class Meta:
        model = Malla
        fields = ('id', 'indice', 'numero_artefactos', 'conductividades')


