#!/bin/bash

git pull && docker build -t xornet-backend . && docker-compose restart -d
