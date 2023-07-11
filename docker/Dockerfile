FROM node:19-alpine

RUN apk update && apk add bash

WORKDIR /app

RUN npm i -g @nestjs/cli

EXPOSE 9229

CMD ["node","--v"]
