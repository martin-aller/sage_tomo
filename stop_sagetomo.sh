#!/bin/bash

#We obtain the PIDs of the processes
redis_pid=`cat /tmp/redis_pid.txt`;
backend_pid=`cat /tmp/backend_pid.txt`;
celery_pid=`cat /tmp/celery_pid.txt`;



#We kill the processes using their PID
kill -9 $redis_pid
kill -9 $backend_pid
fuser -k 8000/tcp # Stop additional backend process
kill -9 $celery_pid
fuser -k 3000/tcp #Stop frontend

killall celery
killall redis-server
