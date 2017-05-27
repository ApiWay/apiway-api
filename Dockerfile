FROM alpine:3.4

LABEL authors="Youngbok Yoon <master@bluehack.net>"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN apk add --update nodejs bash git

COPY . /usr/src/app

ENV PATH /usr/src/app/bin:$PATH

EXPOSE 8080

CMD [ "npm", "start" ]
