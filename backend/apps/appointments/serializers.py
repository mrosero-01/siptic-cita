from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'specialty',
            'specialty_name',
            'date',
            'start_time',
            'description',
            'status',
            'created_by',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_by',
            'created_at',
            'updated_at'

        ]