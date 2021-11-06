from django.urls import path

from .views import ListDataset, ObtieneDataset, ListModelo, obtiene_modelo, ListVoltaje, ListConductividad,reconstruir_img, genera_corte
from .views import entrenar_DNN, entrenar_RF, entrenar_SVM, ListModeloEntrenando, ListModeloPendiente, ListDatasetGenerando, ListDatasetPendiente
from .views import generar_dataset, preparar_dataset, cancelar_entrenamiento, cancelar_tarea_dataset, comparar_modelos
from .views import reconstruir_img_multiple, reconstruir_img_simple, SubirDataset, PredecirConductividades



#Lista de los endpoints de la API REST.


app_name = 'tomo'
urlpatterns = [
    #Datasets
    path('datasets/<int:pk>/', ObtieneDataset.as_view()), #Si permito patch, habría inconsistencias.
    path('datasets/', ListDataset.as_view()),
    path('datasets_generando/', ListDatasetGenerando.as_view()),
    path('datasets_pendientes/', ListDatasetPendiente.as_view()),
    path('cancelar_tarea_dataset/<int:pk>/', cancelar_tarea_dataset),
    path('generar_dataset/', generar_dataset),
    path('preparar_descarga_dataset/<int:pk>/', preparar_dataset),
    path('subir_dataset/', SubirDataset.as_view()),


    #Modelos
    path('modelos/<int:pk>/', obtiene_modelo),
    path('modelos/', ListModelo.as_view()),
    path('modelos_entrenando/', ListModeloEntrenando.as_view()),
    path('modelos_pendientes/', ListModeloPendiente.as_view()),
    path('cancelar_entrenamiento/<int:pk>/', cancelar_entrenamiento),
    path('entrenar_dnn/', entrenar_DNN),
    path('entrenar_rf/', entrenar_RF),
    path('entrenar_svm/', entrenar_SVM),
    path('comparar_modelos/', comparar_modelos),


    #Reconstrucción de imágenes
    path('voltajes/', ListVoltaje.as_view()),
    path('conductividades/', ListConductividad.as_view()),
    path('reconstruir_img/', reconstruir_img),
    path('reconstruir_img_multiple/', reconstruir_img_multiple),
    path('reconstruir_img_simple/', reconstruir_img_simple),
    path('genera_corte/', genera_corte),
    path('predecir_conductividades/', PredecirConductividades.as_view()),

]