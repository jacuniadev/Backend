#!/bin/bash

sudo su geoxor && cd /home/geoxor/backend && git pull && docker build -t xornet-backend . && docker-compose restart -d
