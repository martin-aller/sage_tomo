from django.contrib import admin

from .models import Dataset, Mesh, Model

# Models to monitorize as admin.
admin.site.register(Dataset)
admin.site.register(Mesh)
admin.site.register(Model)