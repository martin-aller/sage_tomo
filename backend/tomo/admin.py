from django.contrib import admin

from .models import Dataset, Malla, Modelo

# Register your models here.
admin.site.register(Dataset)
admin.site.register(Malla)
admin.site.register(Modelo)