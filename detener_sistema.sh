#!/bin/bash

#Obtención de los PIDs de los procesos
redis_pid=`cat /tmp/redis_pid.txt`;
backend_pid=`cat /tmp/backend_pid.txt`;
celery_pid=`cat /tmp/celery_pid.txt`;



#Terminación de los procesos mediante su PID
kill -9 $redis_pid
kill -9 $backend_pid
fuser -k 8000/tcp # El comando para lanzar el backend crea un proceso en el puerto 8000
kill -9 $celery_pid
fuser -k 3000/tcp #Detención del frontend

killall celery
killall redis-server
