from django.db import models


DOCUMENT_TYPE = [
    ("TI", "Tarjeta de identidad"),
    ("CC", "Cedula de ciudadania"),
    ("RC", "Registro civil"),
    ("PS", "Pasaporte")
]


class Patient(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    document_type = models.CharField(max_length=2, choices=DOCUMENT_TYPE)
    n_document = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=19)
    status = models.BooleanField(default=True)
    birth_date = models.DateField()
    comments = models.TextField(max_length=300, blank=True)
    clinical_history = models.FileField(upload_to='clinical_histories/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.n_document} - {self.first_name} {self.last_name}"
