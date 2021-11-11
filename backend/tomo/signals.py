from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_out, user_logged_in
from django.dispatch import receiver
from django.conf import settings
from . import models
from .models import Model
from EIT_module.EITFacade import EITFacade as fi


@receiver(post_save, sender = settings.AUTH_USER_MODEL)
def create_directory_user(sender, instance, created, **kwargs):
    """It creates a user directory each time a new user signs up."""

    if not created:
        return
    fi.create_directory(instance.username)




def login_handler(sender, user, request, **kwargs):
    """Removes junk files from the user's directory each time the user logs in."""

    fi.remove_files(user.username)


user_logged_in.connect(login_handler)



# @receiver(post_delete, sender = Model)
# def remove_model_file(sender, instance, *args, **kwargs):
#     fi.remove_model_file(instance.id)
