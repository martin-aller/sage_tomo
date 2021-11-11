import numpy
from sklearn import metrics
from sklearn.metrics import confusion_matrix
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from tomo.models import Model, Dataset
from .FilesManagement import FilesManagement as gf

import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import sys




class EmailsManagement(object):
    """Esta clase contiene los métodos necesarios para sendle emails electrónicos
    al usuario una vez que se ha completado un training o una subida/generación
    de un dataset iniciados por el usuario."""

    """This class contains all the necessary methods to send emails to an user, once a model training or a 
    dataset upload/generation has finished."""

    @staticmethod
    def send_email_model(model, destinatario):
        """It sends an email to the user when a model trained by him/her has finished training.
        It provides the user with relevant information about the model."""

        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        sender_email = "sistema.tomografico@gmail.com"  # Enter your address
        receiver_email = destinatario  # Enter receiver address
        password = gf.read_sagetomo_email_account()
        
        c1 = "The training of the model with ID {} has finished.\n".format(model.id)
        c2 = "Type of model: {}.\n".format((model.type))
        c3 = "Training dataset ID: {}.\n".format(model.dataset.id)
        c4 = "Go to the Models training sub-section of the Tasks section to save or discard the trained model."
        body_message = c1 + c2 + c3 + c4
   
        mes = MIMEMultipart()
        mes['From'] = sender_email
        mes['To'] = receiver_email
        mes['Subject'] = 'Training finished'
        mes.attach(MIMEText(body_message, 'plain', 'utf-8'))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, mes.as_string())



    @staticmethod
    def send_email_dataset(dataset, destinatario):
        """It sends an email to the user when a dataset in the process of being uploaded/generate
        is already available (upload or generation is completed). 
        It provides the user with relevant information about the dataset."""

        port = 465  # For SSL
        smtp_server = "smtp.gmail.com"
        sender_email = "sistema.tomografico@gmail.com"  # Enter your address
        receiver_email = destinatario  # Enter receiver address
        password = gf.read_sagetomo_email_account()
        

        c1 = "Generation of dataset with ID {} has finished.\n".format(dataset.id)
        c2 = "Number of meshes generated: {}.\n".format(dataset.n_meshes())
        c3 = "Go to the Dataset Generation subsection of the Tasks section to save or discard the generated dataset."
        body_message = c1 + c2 + c3

        mes = MIMEMultipart()
        mes['From'] = sender_email
        mes['To'] = receiver_email
        mes['Subject'] = 'Dataset generation finished'
        mes.attach(MIMEText(body_message, 'plain', 'utf-8'))
        
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, mes.as_string())


