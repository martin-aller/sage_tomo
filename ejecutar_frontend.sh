#!/bin/bash

#$1: path del frontend

if [ $# -gt 0 ]
	then
		cd $1;
		npm start;
	else
		echo "Introduce como argumento el path en el que se encuentre el frontend."
fi
