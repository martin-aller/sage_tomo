# Generated by Django 3.0.4 on 2021-11-10 20:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tomo', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='model',
            name='comentaries',
            field=models.CharField(max_length=300, null=True),
        ),
    ]