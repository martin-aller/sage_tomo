from django.contrib import admin

from .models import Dataset, Mesh, Model, Neural_network_model, Random_forest_model, SVM_model, Metric, Confusion_matrix

# Models to monitorize as admin.
admin.site.register(Dataset)
admin.site.register(Mesh)
admin.site.register(Model)
admin.site.register(Neural_network_model)
admin.site.register(Random_forest_model)
admin.site.register(SVM_model)
admin.site.register(Metric)
admin.site.register(Confusion_matrix)
