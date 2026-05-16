from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'doctor',
            'specialty',
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