from rest_framework import permissions


class EsCreadorOSoloLectura(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: #Permisos de sólo lectura para cualquier request
            return True
        
        return obj.creador == request.user



def es_creador_o_publico(objeto, usuario):
    if (objeto.creador == usuario) or objeto.visible:
        return True
    else:
        return False

def es_creador(objeto, usuario):
    if objeto.creador == usuario:
        return True
    else:
        return False