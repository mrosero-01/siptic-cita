from django.db import models


DAYS_OF_WEEK = [
    (0, 'Lunes'),
    (1, 'Martes'),
    (2, 'Miércoles'),
    (3, 'Jueves'),
    (4, 'Viernes'),
    (5, 'Sábado'),
    (6, 'Domingo')
]


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(max_length=500, blank=True)
    status = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class Doctor(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    n_document = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=19)
    specialty = models.ForeignKey(
        Specialty,
        on_delete=models.PROTECT,
        related_name='doctors'
        )
    status = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"Médico : {self.n_document} - {self.first_name} {self.last_name}"


class DoctorSchedule(models.Model):
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    date = models.DateField()
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK, default=0)
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'date', 'start_time', 'end_time'],
                name='unique_doctor_schedule_date_block'
            )
        ]

    def save(self, *args, **kwargs):
        if self.date:
            self.day_of_week = self.date.weekday()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.doctor.full_name} - {self.date} {self.start_time}"
