from django.apps import AppConfig


class TomoConfig(AppConfig):
    name = 'tomo'

    def ready(self):
        from . import signals
