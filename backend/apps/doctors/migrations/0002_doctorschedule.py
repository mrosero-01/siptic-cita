from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('doctors', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DoctorSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day_of_week', models.IntegerField(choices=[(0, 'Lunes'), (1, 'Martes'), (2, 'Miércoles'), (3, 'Jueves'), (4, 'Viernes'), (5, 'Sábado'), (6, 'Domingo')])),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('status', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('doctor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedules', to='doctors.doctor')),
            ],
            options={
                'ordering': ['day_of_week', 'start_time'],
            },
        ),
        migrations.AddConstraint(
            model_name='doctorschedule',
            constraint=models.UniqueConstraint(fields=('doctor', 'day_of_week', 'start_time', 'end_time'), name='unique_doctor_schedule_block'),
        ),
    ]
