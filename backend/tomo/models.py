from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from math import ceil
import datetime
import random



#Listado de clases para mapear sobre la BD



class Dataset(models.Model):
    #Identificador incremental generado de forma automática
    fecha_creacion = models.DateTimeField()
    r_min = models.IntegerField()
    r_max = models.IntegerField()
    semilla = models.IntegerField()
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    visible = models.BooleanField()
    estado = models.CharField(max_length = 100, null = True)


    def obtiene_mallas(self, n_art = -1): 
        """Devuelve la lista de mallas del dataset."""

        if n_art > 0:
            lista_mallas = Malla.objects.filter(dataset = self, numero_artefactos = n_art).order_by("id")
        else:
            lista_mallas = Malla.objects.filter(dataset = self).order_by("id")

        return lista_mallas


    def obtiene_voltajes(self, n_art = -1):
        """Devuelve la lista de voltajes del dataset."""

        lista_mallas = Malla.objects.filter(dataset = self).order_by("indice")  
        lista_voltajes = [m.voltajes for m in lista_mallas]
        return lista_voltajes



    def obtiene_conductividades(self, n_art = -1):
        """Devuelve la lista de conductividades del dataset."""

        if(n_art <= 0):
            lista_mallas = Malla.objects.filter(dataset = self).order_by("indice")   
        else:
            lista_mallas = Malla.objects.filter(dataset = self, numero_artefactos = n_art).order_by("indice")  

        lista_conductividades = [m.conductividades for m in lista_mallas]
        
        return lista_conductividades



    def n_mallas(self):
        """Devuelve el número de mallas del dataset"""
        n_mallas = Malla.objects.filter(dataset = self).count()
        return (n_mallas)


    def n_mallas_1(self):
        """Devuelve el número de mallas de un artefacto del dataset"""
        n_mallas = Malla.objects.filter(dataset = self, numero_artefactos = 1).count()
        return (n_mallas)

    def n_mallas_2(self):
        """Devuelve el número de mallas de dos artefactos del dataset"""
        n_mallas = Malla.objects.filter(dataset = self, numero_artefactos = 2).count()
        return (n_mallas)

    def n_mallas_3(self):
        """Devuelve el número de mallas de tres artefactos del dataset"""
        n_mallas = Malla.objects.filter(dataset = self, numero_artefactos = 3).count()
        return (n_mallas)


    def obtiene_conjuntos(self, validacion = False):
        """Devuelve conjuntos de entrenamiento (70% de las mallas) y test (30% de las mallas).
        Si el argumento validacion es True, se devuelven tres conjuntos: entrenamiento (70% de
        las mallas), validación (15% de las mallas) y test (15% de las mallas).
        Para cada conjunto devuelve por separado voltajes y conductividades."""

        len_train = ceil(0.7*self.n_mallas())
        #len_test = self.n_mallas() - len_train

        voltajes = self.obtiene_voltajes() 
        random.Random(self.semilla).shuffle(voltajes)

        conductividades = self.obtiene_conductividades()
        random.Random(self.semilla).shuffle(conductividades)

        voltajes_train = voltajes[:len_train]
        conductividades_train = conductividades[:len_train]

        if not validacion:
            voltajes_test = voltajes[len_train:]
            conductividades_test = conductividades[len_train:]
            voltajes_validacion = []
            conductividades_validacion = []
        else:
            len_restante = self.n_mallas() - len_train
            len_val = ceil(len_restante/2) 

            voltajes_test = voltajes[len_train:len_train + len_val]
            conductividades_test = conductividades[len_train:len_train + len_val]
            voltajes_validacion = voltajes[len_train + len_val:]
            conductividades_validacion = conductividades[len_train + len_val:]

        return voltajes_train, conductividades_train, voltajes_test, conductividades_test, voltajes_validacion, conductividades_validacion

    class Meta:
        ordering = ("-id", )




class Malla(models.Model):
    #Identificador incremental generado de forma automática
    indice = models.IntegerField()
    numero_artefactos = models.IntegerField()
    dataset = models.ForeignKey(Dataset, on_delete = models.CASCADE)
    voltajes = ArrayField(models.FloatField())
    conductividades = ArrayField(models.FloatField())

    class Meta:
        unique_together = (("indice", "dataset"),)
        ordering = ("indice", )

class Modelo(models.Model):
    #Identificador incremental generado de forma automática
    tipo = models.CharField(max_length = 30)
    comentarios_adicionales = models.CharField(max_length = 300)
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    visible = models.BooleanField()
    estado = models.CharField(max_length = 50, null = True)
    path_modelo = models.CharField(max_length = 300, null = True)
    dataset = models.ForeignKey(Dataset, on_delete = models.PROTECT)
    umbral_postprocesado = models.FloatField(null = True)
    fecha_hora_inicio = models.DateTimeField() #Por defecto, Django ya establece la fecha-hora actual
    fecha_hora_fin = models.DateTimeField(null = True)

    def tiempo_entrenamiento(self):
        """Devuelve el tiempo de entrenamiento del modelo."""

        if(self.fecha_hora_fin is None or self.fecha_hora_inicio is None):
            return "Sin información."
        tiempo = self.fecha_hora_fin - self.fecha_hora_inicio
        duracion = ""
        
        segundos = tiempo.seconds
        horas, s1 = divmod(segundos,3600)
        minutos, s2 = divmod(s1, 60)
        segundos = ceil(s2)
        
        duracion = str(horas) + " h, " + str(minutos) + " min, " + str(segundos) + " seg"

        return duracion
    
    class Meta:
        ordering = ("-id", )
    
    
class Modelo_red_neuronal(models.Model):
    id_modelo = models.OneToOneField(Modelo, primary_key = True, on_delete = models.CASCADE)
    capas_ocultas = models.IntegerField()
    neuronas_por_capa = ArrayField(models.IntegerField(), size = 10) # Nº de neuronas por capa oculta
    funcion_activacion_interna = models.CharField(max_length = 30)
    funcion_activacion_salida = models.CharField(max_length = 30)
    funcion_error = models.CharField(max_length = 30)
    epocas = models.IntegerField()
    lotes = models.IntegerField(null = True)
    learning_rate = models.FloatField()
    momentum = models.FloatField()
    binario_arquitectura = models.BinaryField() #Código en binario del modelo
    binario_pesos = models.BinaryField()


class Modelo_random_forest(models.Model):
    id_modelo = models.OneToOneField(Modelo, primary_key = True, on_delete = models.CASCADE)
    n_estimadores = models.IntegerField()
    profundidad_max = models.IntegerField() # Profundidad máxima de los árboles
    min_samples_split = models.IntegerField() # Nº mínimo de samples requeridos para dividir un nodo interno
    min_samples_leaf = models.IntegerField() # Nº mínimo de samples requeridos para ser un nodo hoja
    binario_modelo = models.BinaryField()

class Modelo_maquina_soporte_vectorial(models.Model):
    id_modelo = models.OneToOneField(Modelo, primary_key = True, on_delete = models.CASCADE)
    kernel = models.CharField(max_length = 30)
    grado = models.IntegerField()
    gamma = models.CharField(max_length = 30)
    coef0 = models.FloatField()
    tol = models.FloatField()
    c = models.FloatField()
    epsilon =  models.FloatField()
    binario_modelo = models.BinaryField()



class Metrica(models.Model):
    id_modelo = models.ForeignKey(Modelo, on_delete = models.CASCADE, related_name = "metricas")
    nombre_metrica = models.CharField(max_length = 100) # Por defecto, Django ya establece este valor a datetime.now()
    valor_metrica = models.FloatField(null = True)
    class Meta:
        unique_together = (("id_modelo", "nombre_metrica"),)



class Matriz_confusion(models.Model):
    modelo = models.OneToOneField(Modelo, primary_key = True, on_delete = models.CASCADE, related_name = "matriz_confusion")
    verdaderos_negativos = models.IntegerField()
    falsos_positivos  = models.IntegerField()
    falsos_negativos  = models.IntegerField()
    verdaderos_positivos =  models.IntegerField()


class Parametros(models.Model):
    n_voltajes = models.IntegerField()
    n_conductividades = models.IntegerField()
    linea_inicio_vol = models.IntegerField()
    linea_fin_vol = models.IntegerField()
    linea_inicio_imp = models.IntegerField()
    linea_fin_imp = models.IntegerField()

    class Meta:
        managed = False

