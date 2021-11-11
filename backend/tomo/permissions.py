from rest_framework import permissions


class IsCreatorOrOnlyRead(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: #Permisos de sólo lectura para cualquier request
            return True
        
        return obj.creator == request.user



def is_creator_or_public(object, usuario):
    if (object.creator == usuario) or object.visible:
        return True
    else:
        return False

def is_creator(object, usuario):
    if object.creator == usuario:
        return True
    else:
        return False