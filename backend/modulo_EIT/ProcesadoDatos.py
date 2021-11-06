import numpy
from sklearn import metrics
from sklearn.metrics import confusion_matrix
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from tomo.models import Modelo, Matriz_confusion, Malla
from .GestionFicheros import GestionFicheros as gf
import time

class Procesado(object):
    """Esta clase contiene algunos métodos auxiliares para facilitar
    el procesado de datos."""

    @staticmethod
    def filtrar_tuplas(tuplas, y = 0, rango = 0.02):
        """Dada una lista de tuplas, devuelve aquéllas cuya diferencia entre
        su cuarto elemento y el valor de y especificado como segundo parámetro del
        método sea menor que el rango definido."""

        tuplas_filtradas = [t for t in tuplas if abs(y-t[3]) < rango]
        return tuplas_filtradas

    @staticmethod
    def representar_cortes(tuplas, nombre_usuario, y_elegido):
        """Representa gráficamente los cortes sobre una malla, empleando la
        librería matplotlib. Genera una imagen."""

        matplotlib.use('Agg')
        tuplas = sorted(tuplas, key = lambda x: x[2])
        imp1 = [t[0] for t in tuplas]
        imp2 = [t[1] for t in tuplas]
        x = [t[2] for t in tuplas]
        
        plt.plot(x, imp1,  'b', label ="Actual conductivities")
        plt.plot(x, imp2, 'r', label = "Predicted conductivities")
        plt.legend(loc='best')
        #parche_rojo = mpatches.Patch(color='red', label='Conductividades reales')
        #parche_azul = mpatches.Patch(color='blue', label='Conductividades predichas')
        #plt.legend(handles=[parche_rojo])

        plt.axis([-1, 1, 0, 140])
        plt.title("Cutting on Y = {}".format(y_elegido))
        plt.xlabel("X(m)")
        plt.ylabel("Electrical conductivity (S/m)")
        #plt.show()
        marca = int(round(time.time() * 1000))
        cortes_png = "cortes_{}_{}.png".format(nombre_usuario, marca)
        plt.savefig(gf.construye_path_imagenes(cortes_png))
        plt.clf() #Clean figure
        plt.close()
        return cortes_png

    @staticmethod
    def cortes(id_malla_real, conductividades_predichas, nombre_usuario, y_elegido):
        """Realiza los cortes de la malla indicada en el eje Y indicado mediante el argumento
        y_elegido."""
        conductividades_reales = Malla.objects.get(id = id_malla_real).conductividades
        coord = gf.leer_coordenadas()
        print("LONGITUD REALES:", len(conductividades_reales))
        print("LONGITUD PREDICHAS:", len(conductividades_predichas))
        tuplas = [(conductividades_reales[i], conductividades_predichas[i], coord[i][0], coord[i][1]) for i in range(len(conductividades_predichas))]
        tuplas_filtradas = Procesado.filtrar_tuplas(tuplas, y = y_elegido, rango = 0.02)
        return Procesado.representar_cortes(tuplas_filtradas, nombre_usuario, y_elegido)




    @staticmethod
    def obtener_valores(lista_diccionarios):
        lista = []
        for d in lista_diccionarios:
            lista.append(list(d.values())[0])
        return lista


    @staticmethod
    def asigna_valores_metricas_ann(lista_metricas_DAO, evaluacion_modelo):
        i = 1
        for m in lista_metricas_DAO: #Lista de las métricas de un modelo particular
            m.valor_metrica = round(evaluacion_modelo[i], 4)
            m.save()
            print("ÍNDICE:", i)
            i+=1

    @staticmethod
    def asigna_valores_metricas_generico(lista_metricas_DAO, test_output, pred_output, id_modelo = -1):
        i = 1
        for m in lista_metricas_DAO: #Lista de las métricas de un modelo particular
            if (m.nombre_metrica.casefold() == "mse".casefold() or m.nombre_metrica == "mean_squared_error"):
                m.valor_metrica = round(metrics.mean_squared_error(test_output, pred_output), 4)
            elif(m.nombre_metrica.casefold() == "mae".casefold() or m.nombre_metrica == "mean_absolute_error"):
                m.valor_metrica = round(metrics.mean_absolute_error(test_output, pred_output), 4)
            elif(m.nombre_metrica.casefold() == "msle".casefold() or m.nombre_metrica == "mean_squared_logarithmic_error"):
                m.valor_metrica = round(metrics.mean_squared_log_error(test_output, abs(pred_output)), 4)
            elif(m.nombre_metrica.casefold() == "acierto".casefold()):
                porcentaje,mc = Procesado.porcentaje_acierto(id_modelo, test_output, pred_output)
                m.valor_metrica = round(porcentaje, 4)
                mc.save()
            m.save()
            i+=1



    @staticmethod
    def matriz_confusion(id_modelo, lista_test, lista_pred): #Los argumentos son listas de listas de 1's y 0's
        """Instacia y devuelve una matriz de confusión a partir de las dos listas binarias
        pasadas como segundo y tercer argumentos."""

        tn, fp, fn, tp = confusion_matrix(lista_test.flatten(), lista_pred.flatten()).ravel()

        mc = Matriz_confusion(modelo = Modelo.objects.get(id = id_modelo),verdaderos_negativos = tn, falsos_positivos = fp, falsos_negativos = fn, verdaderos_positivos = tp)
        return mc

    @staticmethod
    def porcentaje_acierto(id_modelo, test_output, pred_output):
        '''Primero genero dos ndarray binarios. Para ello, a partir de los
        ndarray original, sustituyo por valor 0 los valores de background y por valor
        1 el resto de valores. Devuelve el porcentaje de acierto de un modelo, así como
        su matriz de confusión.'''

        n = len(test_output)
        m = len(test_output[0])
    
        lista_test = numpy.where(test_output == 1, 0, 1)
        lista_pred = numpy.where(pred_output == 1, 0, 1)
    
        aciertos = numpy.sum(lista_test == lista_pred)
        porcentaje = (aciertos/(n*m))*100
        mc = Procesado.matriz_confusion(id_modelo, lista_test, lista_pred)
        return porcentaje, mc

    @staticmethod
    def postprocesar(pred_output, umbral):
        """Aplica el postprocesado sobre una lista de conductividades, utilizando
        el umbral especificado como segundo argumento."""

        return numpy.where(pred_output <= umbral, 1, pred_output)


    @staticmethod
    def postprocesar_individual(pred_output, umbral):
        """A diferencia del método anterior, el primer argumento de este método
        es una lista unidimensional."""

        l = numpy.array(pred_output)
        return numpy.where(l <= umbral, 1, l)


    @staticmethod
    def asignar_umbral(modelo, test_output, pred_output):
        """Utiliza el método de las curvas ROC para determinar cuál es el umbral
        óptimo para un determinado modelo."""

        test_plano = test_output.flatten()
        pred_plano = pred_output.flatten()
        test_plano_binario = numpy.where(test_plano == 1, 0, 1)
        
        fpr, tpr, thresholds = metrics.roc_curve(test_plano_binario, pred_plano)
        indice_optimo = numpy.argmax(tpr - fpr)
        umbral_optimo = thresholds[indice_optimo]
        modelo.umbral_postprocesado = umbral_optimo
        modelo.save()
        print("Umbral postprocesado:", modelo.umbral_postprocesado)