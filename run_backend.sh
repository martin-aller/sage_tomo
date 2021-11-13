#!/bin/bash

#$1: Python virtual environment path.
#$2: backend path.

if [ $# -gt 1 ]
	then
		#service redis-server stop
		redis-server &
		redis_pid=$! #The PID of the last executed process is stored in a variable.
	    	source $1/bin/activate; 
		cd $2;
		python manage.py runserver &
		backend_pid=$!
		#celery worker -A tomo_backend --pool=solo --loglevel=info &
		celery worker -A tomo_backend --pool=solo --loglevel=info &

		celery_pid=$!

		#We write process PIDs to temporary files
		#They will be saved in the /tmp directory and will allow processes to be stopped if desired.

		echo $redis_pid > /tmp/redis_pid.txt
		echo $backend_pid > /tmp/backend_pid.txt
		echo $celery_pid > /tmp/celery_pid.txt

		chmod 777 /tmp/redis_pid.txt
		chmod 777 /tmp/backend_pid.txt
		chmod 777 /tmp/celery_pid.txt
	else
		echo "Enter as arguments the path of the Python virtual environment you want to use (without the final '/') and the path where the backend is located."
fi






