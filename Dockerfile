FROM ubuntu:18.04
RUN apt-get update
# install curl 
RUN apt-get install curl -y
RUN apt-get install build-essential -y
# get install script and pass it to execute: 
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
# and install node 
RUN apt-get install nodejs -y
# confirm that it was successful 
RUN node -v
# npm installs automatically 
RUN npm -v
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build


FROM node:14-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=0 /app/build ./
EXPOSE 3000
CMD [ "serve", "-s", "/app","-l","3000" ]
