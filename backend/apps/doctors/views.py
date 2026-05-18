from django.db.models import ProtectedError
from rest_framework import serializers, viewsets
from .models import Specialty, Doctor, DoctorSchedule
from .serializers import SpecialtySerializer, DoctorSerializer, DoctorScheduleSerializer


class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise serializers.ValidationError({
                'detail': 'No se puede eliminar esta especialidad porque tiene médicos o citas asociadas.'
            })


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise serializers.ValidationError({
                'detail': 'No se puede eliminar este médico porque tiene citas asociadas.'
            })


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    queryset = DoctorSchedule.objects.select_related('doctor', 'doctor__specialty').all()
    serializer_class = DoctorScheduleSerializer
