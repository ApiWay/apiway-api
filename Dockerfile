FROM alpine:3.4

LABEL authors="bluaheckmaster <master@bluehack.net>"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN apk add --update nodejs bash git mosquitto-clients

COPY . /usr/src/app

RUN npm install

ENV PATH /usr/src/app/bin:$PATH

EXPOSE 8080

CMD [ "npm", "start" ]
