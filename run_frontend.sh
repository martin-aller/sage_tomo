#!/bin/bash

#$1: path del frontend

if [ $# -gt 0 ]
	then
		cd $1;
		npm start;
	else
		echo "Enter as argument the path where the frontend is located."
fi
