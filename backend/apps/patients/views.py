from django.db.models import ProtectedError
from rest_framework import serializers, viewsets
from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise serializers.ValidationError({
                'detail': 'No se puede eliminar este paciente porque tiene citas asociadas.'
            })
