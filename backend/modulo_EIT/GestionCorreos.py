import numpy
from sklearn import metrics
from sklearn.metrics import confusion_matrix
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from tomo.models import Modelo, Dataset
from .GestionFicheros import GestionFicheros as gf

import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import sys




class GestionCorreos(object):
    """Esta clase contiene los métodos necesarios para enviarle correos electrónicos
    al usuario una vez que se ha completado un entrenamiento o una subida/generación
    de un dataset iniciados por el usuario."""

    @staticmethod
    def enviar_correo_modelo(modelo, destinatario):
        """Envía un correo al usuario cuando un modelo entrenado por él ha finalizado
        el entrenamiento. Ofrece al usuario información relevante sobre el modelo."""

        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        sender_email = "sistema.tomografico@gmail.com"  # Enter your address
        receiver_email = destinatario  # Enter receiver address
        password = "jsvk38fj"
        
        c1 = "El entrenamiento del modelo con id {} ha finalizado.\n".format(modelo.id)
        c2 = "Tipo de modelo: {}.\n".format((modelo.tipo))
        c3 = "Id del dataset de entrenamiento: {}.\n".format(modelo.dataset.id)
        #c4 = "Acude al apartado de Entrenamientos de la sección de Tareas para guardar o descartar el modelo entrenado."
        c4 = "Acude al subapartado de Entrenamientos del apartado de Tareas para guardar o descartar el modelo entrenado."
        cuerpo_mensaje = c1 + c2 + c3 + c4
   
        mes = MIMEMultipart()
        mes['From'] = sender_email
        mes['To'] = receiver_email
        mes['Subject'] = 'Entrenamiento finalizado'
        mes.attach(MIMEText(cuerpo_mensaje, 'plain', 'utf-8'))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, mes.as_string())

    @staticmethod
    def enviar_correo_dataset(dataset, destinatario):
        """Envía un correo al usuario cuando un dataset en proceso de ser subido/generado
        ya está disponible (se ha completado la subida o la generación). 
        Ofrece al usuario información relevante sobre el dataset."""

        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        sender_email = "sistema.tomografico@gmail.com"  # Enter your address
        receiver_email = destinatario  # Enter receiver address
        password = "jsvk38fj"
        

        c1 = "La generación del dataset con id {} ha finalizado.\n".format(dataset.id)
        c2 = "Número de mallas generadas: {}.\n".format(dataset.n_mallas())
        c3 = "Acude al subapartado de Generación de datasets del apartado de Tareas para guardar o descartar el dataset generado."
        cuerpo_mensaje = c1 + c2 + c3

        mes = MIMEMultipart()
        mes['From'] = sender_email
        mes['To'] = receiver_email
        mes['Subject'] = 'Generación de dataset finalizada'
        mes.attach(MIMEText(cuerpo_mensaje, 'plain', 'utf-8'))
        
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, mes.as_string())


