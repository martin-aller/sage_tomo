# Generated by Django 3.0.4 on 2021-11-13 19:49

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('datetime_start', models.DateTimeField()),
                ('datetime_end', models.DateTimeField(null=True)),
                ('min_radius', models.IntegerField()),
                ('max_radius', models.IntegerField()),
                ('seed', models.IntegerField()),
                ('visible', models.BooleanField()),
                ('state', models.CharField(max_length=100, null=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-id',),
            },
        ),
        migrations.CreateModel(
            name='Model',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=30)),
                ('comentaries', models.CharField(blank=True, max_length=300, null=True)),
                ('visible', models.BooleanField()),
                ('state', models.CharField(max_length=50, null=True)),
                ('path_model', models.CharField(blank=True, max_length=300, null=True)),
                ('postprocessing_threshold', models.FloatField(null=True)),
                ('datetime_start', models.DateTimeField()),
                ('datetime_end', models.DateTimeField(null=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='tomo.Dataset')),
            ],
            options={
                'ordering': ('-id',),
            },
        ),
        migrations.CreateModel(
            name='Confusion_matrix',
            fields=[
                ('model', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='confusion_matrix', serialize=False, to='tomo.Model')),
                ('true_negatives', models.IntegerField()),
                ('false_positives', models.IntegerField()),
                ('false_negatives', models.IntegerField()),
                ('true_positives', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Neural_network_model',
            fields=[
                ('id_model', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='tomo.Model')),
                ('hidden_layers', models.IntegerField()),
                ('neurons_per_layer', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(), size=10)),
                ('inside_activation_function', models.CharField(max_length=30)),
                ('outside_activation_function', models.CharField(max_length=30)),
                ('error_function', models.CharField(max_length=30)),
                ('epochs', models.IntegerField()),
                ('batch_size', models.IntegerField(null=True)),
                ('learning_rate', models.FloatField()),
                ('momentum', models.FloatField()),
                ('architecture_binary', models.BinaryField()),
                ('weights_binary', models.BinaryField()),
            ],
        ),
        migrations.CreateModel(
            name='Random_forest_model',
            fields=[
                ('id_model', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='tomo.Model')),
                ('n_estimators', models.IntegerField()),
                ('max_depth', models.IntegerField()),
                ('min_samples_split', models.IntegerField()),
                ('min_samples_leaf', models.IntegerField()),
                ('model_binary', models.BinaryField()),
            ],
        ),
        migrations.CreateModel(
            name='SVM_model',
            fields=[
                ('id_model', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='tomo.Model')),
                ('kernel', models.CharField(max_length=30)),
                ('degree', models.IntegerField()),
                ('gamma', models.CharField(max_length=30)),
                ('coef0', models.FloatField()),
                ('tol', models.FloatField()),
                ('c', models.FloatField()),
                ('epsilon', models.FloatField()),
                ('model_binary', models.BinaryField()),
            ],
        ),
        migrations.CreateModel(
            name='Metric',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('value', models.FloatField(null=True)),
                ('id_model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='tomo.Model')),
            ],
            options={
                'unique_together': {('id_model', 'name')},
            },
        ),
        migrations.CreateModel(
            name='Mesh',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index', models.IntegerField()),
                ('number_artifacts', models.IntegerField()),
                ('voltages', django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(), size=None)),
                ('conductivities', django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(), size=None)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tomo.Dataset')),
            ],
            options={
                'ordering': ('index',),
                'unique_together': {('index', 'dataset')},
            },
        ),
    ]
