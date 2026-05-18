from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        doctor = attrs.get('doctor', getattr(self.instance, 'doctor', None))
        date = attrs.get('date', getattr(self.instance, 'date', None))
        start_time = attrs.get('start_time', getattr(self.instance, 'start_time', None))

        if doctor and date and start_time:
            queryset = Appointment.objects.filter(doctor=doctor, date=date, start_time=start_time)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({
                    'detail': 'Este médico ya tiene una cita programada en esa fecha y hora.'
                })

        return attrs

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

        validators = []

        read_only_fields = [
            'id',
            'created_by',
            'created_at',
            'updated_at'

        ]