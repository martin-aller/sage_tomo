from django.urls import path

from .views import ListDatasets, GetDataset, ListModels, get_model, ListVoltages, ListConductivities,reconstruct_img, generate_cut
from .views import train_DNN, train_RF, train_SVM, ListTrainingModels, ListPendingModels, ListGeneratingDatasets, ListPendingDatasets
from .views import generate_dataset, prepare_dataset, cancel_training, cancel_dataset_task, compare_models
from .views import reconstruct_img_multiple, reconstruct_img_simple, UploadDataset, PredictConductivities



#List of the REST API endpoints.


app_name = 'tomo'
urlpatterns = [
    #Datasets
    path('datasets/<int:pk>/', GetDataset.as_view()), 
    path('datasets/', ListDatasets.as_view()),
    path('datasets_generating/', ListGeneratingDatasets.as_view()),
    path('datasets_pending/', ListPendingDatasets.as_view()),
    path('cancel_dataset_task/<int:pk>/', cancel_dataset_task),
    path('generate_dataset/', generate_dataset),
    path('prepare_dataset_download/<int:pk>/', prepare_dataset),
    path('upload_dataset/', UploadDataset.as_view()),


    #Models
    path('models/<int:pk>/', get_model),
    path('models/', ListModels.as_view()),
    path('models_training/', ListTrainingModels.as_view()),
    path('models_pending/', ListPendingModels.as_view()),
    path('cancel_training/<int:pk>/', cancel_training),
    path('train_dnn/', train_DNN),
    path('train_rf/', train_RF),
    path('train_svm/', train_SVM),
    path('compare_models/', compare_models),


    #Image reconstruction
    path('voltages/', ListVoltages.as_view()),
    path('conductivities/', ListConductivities.as_view()),
    path('reconstruct_img/', reconstruct_img),
    path('reconstruct_img_multiple/', reconstruct_img_multiple),
    path('reconstruct_img_simple/', reconstruct_img_simple),
    path('generate_cut/', generate_cut),
    path('predict_conductivities/', PredictConductivities.as_view()),

]