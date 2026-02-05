FROM node:20-alpine

RUN apk update && apk add bash

WORKDIR /app

RUN npm i -g @nestjs/cli

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 9229

CMD ["npm","test"]
