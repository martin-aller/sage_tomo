from .FilesManagement import FilesManagement as gf
from .ModelsManagement import ModelsManagement as gm
from .ImagesReconstruction import RecImg as ri
from .DataProcessing import Processing as pro
from .DatasetsManagement import DatasetsManagement as gd

#The class EITFacade acts as the facade of the package EIT_module and contains all the necessary methods 
#to use the classes from this package.


class EITFacade(object):
    #--------------------------------FileManagement methods--------------------------------
    @staticmethod
    def build_path_directory(nombre_file, username):
        return gf.build_path_directory(nombre_file, username)


    @staticmethod
    def remove_files(username):
        gf.remove_files(username)

    @staticmethod
    def create_directory(username):
        gf.create_directory(username)
    
    @staticmethod
    def generate_dataset_file(dataset_id, username):
        gf.generate_dataset_file(dataset_id, username)

    @staticmethod
    def write_predictions(username, voltages, predicted_conductivities):
        gf.write_predictions(username, voltages, predicted_conductivities)

    @staticmethod
    def read_predictions(username):
        return gf.read_predictions(username)

    @staticmethod
    def remove_dataset_directory(username, id_dataset):
        gf.remove_dataset_directory(username, id_dataset)

    @staticmethod
    def remove_model_file(id):
        return gf.remove_model_file(id)




    #--------------------------------ModelManagement methods--------------------------------
    @staticmethod
    def load_model(id_model_selected, username):
        return gm.load_model(id_model_selected, username)

    @staticmethod
    def train_model(id):
        gm.train_model(id)

    @staticmethod
    def compare_models(username, list_id_models, metrics_list, id_dataset, postprocessing_flag):
        return gm.compare_models(username, list_id_models, metrics_list, id_dataset, postprocessing_flag)
    




    #--------------------------------ImagesReconstruction methods--------------------------------
    @staticmethod
    def reconstruct_img(id_mesh_selectionada, id_model, username, postprocessing_flag = True):
        return ri.reconstruct_img(id_mesh_selectionada, id_model, username, postprocessing_flag)

    @staticmethod
    def reconstruct_img_single(predicted_conductivities, id_model, username, postprocessing_flag = True):
        return ri.reconstruct_img_single(predicted_conductivities, id_model, username, postprocessing_flag)
    
    @staticmethod
    def reconstruct_img_several_models(id_models, username, id_dataset, mesh_index, postprocessing_flag = False):
        return ri.reconstruct_img_several_models(id_models, username, id_dataset, mesh_index, postprocessing_flag)
    
    @staticmethod 
    def predict_conductivities(id_model, file, username):
        return ri.predict_conductivities(id_model, file, username)




    #--------------------------------DataProcessing methods--------------------------------
    @staticmethod
    def cuts(id_mesh_real, predicted_conductivities, username, y_elegido):
        return pro.cuts(id_mesh_real, predicted_conductivities, username, y_elegido)

    @staticmethod
    def get_values(list_diccionarios): #No sé si estoy usando esto para algo
        return pro.get_values(list_diccionarios)




    # #--------------------------------DatasetsManagement methods--------------------------------
    @staticmethod
    def initiate_dataset_task(dataset, file_dataset = False, tuple_n_meshes = (0,0,0)):
        return gd.initiate_dataset_task(dataset, file = file_dataset, tuple_n_meshes=tuple_n_meshes)
    

