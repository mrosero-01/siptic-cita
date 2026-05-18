from datetime import date
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('doctors', '0002_doctorschedule'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='doctorschedule',
            name='unique_doctor_schedule_block',
        ),
        migrations.AddField(
            model_name='doctorschedule',
            name='date',
            field=models.DateField(default=date.today),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='doctorschedule',
            name='day_of_week',
            field=models.IntegerField(choices=[(0, 'Lunes'), (1, 'Martes'), (2, 'Miércoles'), (3, 'Jueves'), (4, 'Viernes'), (5, 'Sábado'), (6, 'Domingo')], default=0),
        ),
        migrations.AlterModelOptions(
            name='doctorschedule',
            options={'ordering': ['date', 'start_time']},
        ),
        migrations.AddConstraint(
            model_name='doctorschedule',
            constraint=models.UniqueConstraint(fields=('doctor', 'date', 'start_time', 'end_time'), name='unique_doctor_schedule_date_block'),
        ),
    ]
