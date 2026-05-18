from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='clinical_history',
            field=models.FileField(blank=True, null=True, upload_to='clinical_histories/'),
        ),
    ]
