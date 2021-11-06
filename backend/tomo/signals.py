from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_out, user_logged_in
from django.dispatch import receiver
from django.conf import settings
from . import models
from .models import Modelo
from modulo_EIT.FachadaEIT import FachadaEIT as fi


@receiver(post_save, sender = settings.AUTH_USER_MODEL)
def crear_directorio_usuario(sender, instance, created, **kwargs):
    """Crea un directorio de usuario cada vez que se registra un nuevo usuario."""
    if not created:
        return
    fi.crea_directorio(instance.username)




def login_handler(sender, user, request, **kwargs):
    """Elimina ficheros basura del directorio del usuario cada vez que éste inicia sesión."""
    print(user.username)
    print('logged in')
    fi.eliminar_ficheros(user.username)

user_logged_in.connect(login_handler)



# @receiver(post_delete, sender = Modelo)
# def eliminar_fichero_modelo(sender, instance, *args, **kwargs):
#     fi.eliminar_fichero_modelo(instance.id)
