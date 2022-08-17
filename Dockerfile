FROM node:14-alpine
RUN apk update
RUN apk add git
RUN apk add g++ make py3-pip
ENV NODE_ENV=production

WORKDIR /app
COPY package.json .
COPY build .
RUN yarn global add serve

COPY . .
EXPOSE 3000
CMD [ "yarn","serve" ]
