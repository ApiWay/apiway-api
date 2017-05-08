FROM alpine:3.4

LABEL authors="Youngbok Yoon <master@bluehack.net>"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN apk add --update nodejs bash git

COPY . /usr/src/app

EXPOSE 8080

CMD [ "npm", "start" ]
