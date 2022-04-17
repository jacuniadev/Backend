FROM node:17
WORKDIR /home/node/app
COPY . /home/node/app
RUN npm i
RUN npm run build:typescript
CMD while true; do timeout 2h node ./dist/js/src; done