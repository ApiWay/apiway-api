FROM alpine:3.4

LABEL authors="Youngbok Yoon <master@bluehack.net>"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN apk add --update nodejs bash git curl

COPY . /usr/src/app

RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl && chmod +x kubectl

ENV PATH /usr/src/app:$PATH

EXPOSE 8080

CMD [ "npm", "start" ]
