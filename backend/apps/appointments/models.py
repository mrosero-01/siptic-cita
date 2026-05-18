from django.db import models
from apps.doctors.models import Specialty, Doctor
from apps.patients.models import Patient
from django.conf import settings


STATUS = [
    ('PENDING', 'Pendiente'),
    ('CONFIRMED', 'Confirmada'),
    ('CANCELLED', 'Cancelada'),
    ('RESCHEDULED', 'Reagendada'),
    ('ATTENDED', 'Atendida'),
    ('NO_SHOW', 'No asistió'),
]


class Appointment(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='appointments'
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.PROTECT,
        related_name='appointments'
    )
    specialty = models.ForeignKey(
        Specialty,
        on_delete=models.PROTECT,
        related_name='appointments'
    )
    date = models.DateField()
    start_time = models.TimeField()
    description = models.TextField(max_length=500, blank=True)
    status = models.CharField(max_length=15, choices=STATUS, default='PENDING')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_appointments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'date', 'start_time'],
                name='unique_doctor_appointment_datetime'
            )
        ]

    def __str__(self):
        return f"Cita de {self.patient} con {self.doctor} - {self.date} {self.start_time}"
