

from rest_framework import viewsets
from .models import Specialty, Doctor
from .serializers import SpecialtySerializer, DoctorSerializer

# Create your views here.
class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all() # trae todos los datos de la db
    serializer_class = SpecialtySerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    