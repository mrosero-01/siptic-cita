from rest_framework import serializers
from .models import Specialty, Doctor, DoctorSchedule

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = [
            'id',
            'name',
            'description',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

class DoctorSerializer(serializers.ModelSerializer):
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)

    class Meta:
        model = Doctor
        fields = [
            'id',
            'first_name',
            'last_name',
            'n_document',
            'email',
            'phone',
            'specialty',
            'specialty_name',
            'status',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    specialty = serializers.IntegerField(source='doctor.specialty_id', read_only=True)
    specialty_name = serializers.CharField(source='doctor.specialty.name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = DoctorSchedule
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'specialty',
            'specialty_name',
            'date',
            'day_of_week',
            'day_name',
            'formatted_date',
            'start_time',
            'end_time',
            'status',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'doctor_name',
            'specialty',
            'specialty_name',
            'day_of_week',
            'day_name',
            'formatted_date',
            'created_at',
            'updated_at'
        ]

    def get_formatted_date(self, obj):
        months = [
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre'
        ]
        return f"{obj.get_day_of_week_display()} {obj.date.day} de {months[obj.date.month - 1]} de {obj.date.year}"

    def validate(self, attrs):
        doctor = attrs.get('doctor', getattr(self.instance, 'doctor', None))
        date = attrs.get('date', getattr(self.instance, 'date', None))
        start_time = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = attrs.get('end_time', getattr(self.instance, 'end_time', None))

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                'detail': 'La hora final debe ser mayor que la hora inicial.'
            })

        if doctor and date and start_time and end_time:
            queryset = DoctorSchedule.objects.filter(
                doctor=doctor,
                date=date,
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({
                    'detail': 'Este médico ya tiene una disponibilidad que se cruza con esa franja horaria.'
                })

        return attrs
