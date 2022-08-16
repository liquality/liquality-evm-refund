FROM node:14-alpine
RUN apk update
RUN apk add git
ENV NODE_ENV=production

WORKDIR /app
COPY package*.json .
RUN npm install react-scripts@3.4.1 -g
RUN npm install

COPY . .
EXPOSE 3000
CMD [ "npm", "run", "start" ]
