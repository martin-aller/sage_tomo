import numpy
from sklearn import metrics
from sklearn.metrics import confusion_matrix
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from tomo.models import Model, Confusion_matrix, Mesh
from .FilesManagement import FilesManagement as gf
import time

class Processing(object):
    """This class contains some auxiliary methods to facilitate data processing."""

    @staticmethod
    def filter_tuples(tuples, y = 0, rango = 0.02):
        """Given a list of tuples, it returns those whose difference between their fourth element and 
        the value of y specified as the second parameter is less than the defined range."""

        tuples_filtradas = [t for t in tuples if abs(y-t[3]) < rango]
        return tuples_filtradas

    @staticmethod
    def plot_cuts(tuples, username, y_elegido):
        """It plots the cuts made on a mesh, using the matplotlib library. It generates an image."""

        matplotlib.use('Agg')
        tuples = sorted(tuples, key = lambda x: x[2])
        imp1 = [t[0] for t in tuples]
        imp2 = [t[1] for t in tuples]
        x = [t[2] for t in tuples]
        
        plt.plot(x, imp1,  'b', label ="Actual conductivities")
        plt.plot(x, imp2, 'r', label = "Predicted conductivities")
        plt.legend(loc='best')

        plt.axis([-1, 1, 0, 140])
        plt.title("Cutting on Y = {}".format(y_elegido))
        plt.xlabel("X(m)")
        plt.ylabel("Electrical conductivity (S/m)")
        
        marca = int(round(time.time() * 1000))
        cuts_png = "cuts_{}_{}.png".format(username, marca)
        plt.savefig(gf.build_path_images(cuts_png))
        plt.clf() #Clean figure
        plt.close()
        return cuts_png


    @staticmethod
    def cuts(id_mesh_real, predicted_conductivities, username, y_elegido):
        """It makes the cuts for the specified mesh on the y-axis indicated by the argument y_elegido."""

        conductivities_reales = Mesh.objects.get(id = id_mesh_real).conductivities
        coord = gf.read_coordinates()
        tuples = [(conductivities_reales[i], predicted_conductivities[i], coord[i][0], coord[i][1]) for i in range(len(predicted_conductivities))]
        tuples_filtradas = Processing.filter_tuples(tuples, y = y_elegido, rango = 0.02)
        return Processing.plot_cuts(tuples_filtradas, username, y_elegido)




    @staticmethod
    def get_values(list_diccionarios):
        l = []
        for d in list_diccionarios:
            l.append(list(d.values())[0])
        return l



    @staticmethod
    def assign_values_metrics_ann(metrics_list_DAO, evaluacion_model):
        i = 1
        for m in metrics_list_DAO: #Lista de las métricas de un model particular
            m.value = round(evaluacion_model[i], 4)
            m.save()
            i+=1


    @staticmethod
    def assign_values_metrics_generic(metrics_list_DAO, test_output, pred_output, id_model = -1):
        i = 1
        for m in metrics_list_DAO: #Lista de las métricas de un model particular
            if (m.name.casefold() == "mse".casefold() or m.name == "mean_squared_error"):
                m.value = round(metrics.mean_squared_error(test_output, pred_output), 4)
            elif(m.name.casefold() == "mae".casefold() or m.name == "mean_absolute_error"):
                m.value = round(metrics.mean_absolute_error(test_output, pred_output), 4)
            elif(m.name.casefold() == "msle".casefold() or m.name == "mean_squared_logarithmic_error"):
                m.value = round(metrics.mean_squared_log_error(test_output, abs(pred_output)), 4)
            elif(m.name.casefold() == "acierto".casefold()):
                percentage,mc = Processing.accuracy_percentage(id_model, test_output, pred_output)
                m.value = round(percentage, 4)
                mc.save()
            m.save()
            i+=1



    @staticmethod
    def confusion_matrix(id_model, list_test, list_pred): #Los argumentos son lists de lists de 1's y 0's
        """It instantiates and returns a confusion matrix from the two binary lists passed as the second and third arguments."""

        tn, fp, fn, tp = confusion_matrix(list_test.flatten(), list_pred.flatten()).ravel()
        mc = Confusion_matrix(model = Model.objects.get(id = id_model),true_negatives = tn, false_positives = fp, false_negatives = fn, true_positives = tp)
        return mc



    @staticmethod
    def accuracy_percentage(id_model, test_output, pred_output):
        '''First, we generate two binary ndarrays. To do so, from the original ndarray, we subtitute background values by 0 and
        the rest of values by 1. The method returns the model accuracy percentage, as well as the confussion matrix.'''

        n = len(test_output)
        m = len(test_output[0])
    
        list_test = numpy.where(test_output == 1, 0, 1)
        list_pred = numpy.where(pred_output == 1, 0, 1)
    
        aciertos = numpy.sum(list_test == list_pred)
        percentage = (aciertos/(n*m))*100
        mc = Processing.confusion_matrix(id_model, list_test, list_pred)
        return percentage, mc



    @staticmethod
    def postprocessing(pred_output, threshold):
        """It applies postprocessing on a list of conductivities, using the threshold specified as the second argument."""

        return numpy.where(pred_output <= threshold, 1, pred_output)


    @staticmethod
    def postprocessing_individual(pred_output, threshold):
        """Unlike the previous method, the first argument of this method is a one-dimensional list."""

        l = numpy.array(pred_output)
        return numpy.where(l <= threshold, 1, l)


    @staticmethod
    def assign_threshold(model, test_output, pred_output):
        """It uses the method of ROC curves to determine the optimal threshold for a given model."""

        test_plano = test_output.flatten()
        pred_plano = pred_output.flatten()
        test_plano_binario = numpy.where(test_plano == 1, 0, 1)
        
        fpr, tpr, thresholds = metrics.roc_curve(test_plano_binario, pred_plano)
        index_optimo = numpy.argmax(tpr - fpr)
        threshold_optimo = thresholds[index_optimo]
        model.postprocessing_threshold = threshold_optimo
        model.save()
