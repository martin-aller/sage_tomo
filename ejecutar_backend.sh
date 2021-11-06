#!/bin/bash

#$1: path del entorno virtual de Python.
#$2: path del backend.

if [ $# -gt 1 ]
	then
		#service redis-server stop
		redis-server &
		redis_pid=$! #Se guarda en una variable el PID del último proceso ejecutado
	    	source $1/bin/activate; 
		cd $2;
		python manage.py runserver &
		backend_pid=$!
		celery worker -A tomo_backend --pool=solo --loglevel=info &
		celery_pid=$!

		#Escritura de los PIDs de los procesos en ficheros temporales
		#Se guardarán en el directorio /tmp y permitirán detener los procesos si se desea.

		echo $redis_pid > /tmp/redis_pid.txt
		echo $backend_pid > /tmp/backend_pid.txt
		echo $celery_pid > /tmp/celery_pid.txt

		chmod 777 /tmp/redis_pid.txt
		chmod 777 /tmp/backend_pid.txt
		chmod 777 /tmp/celery_pid.txt
	else
		echo "Introduce como argumentos el path del entorno virtual de Python que deseas utilizar (sin el '/' final) y el path en el que se encuentre el backend."
fi






