import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tomo_backend.settings')

celery_app = Celery('tomo_backend')
celery_app.config_from_object('django.conf:settings', namespace='CELERY')
celery_app.autodiscover_tasks()


