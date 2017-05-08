#!/usr/bin/env bash

REPOSITORY="apiway-api"
TAG=$1
AWS_CONTAINER_REGISTRY="539277938309.dkr.ecr.us-west-2.amazonaws.com"


aws ecr get-login --region us-west-2 > ecr_login.sh
chmod +x ecr_login.sh
./ecr_login.sh

docker build -t $REPOSITORY:$TAG .
docker tag $REPOSITORY:$TAG $AWS_CONTAINER_REGISTRY/$REPOSITORY:$TAG
docker push $AWS_CONTAINER_REGISTRY/$REPOSITORY:$TAG
kubectl rolling-update $REPOSITORY --image $AWS_CONTAINER_REGISTRY/$REPOSITORY:$TAG

#kubectl rolling-update $REPOSITORY --rollback=true
if [ $? -ne 0 ]; then
    kubectl rolling-update $REPOSITORY --rollback=true
fi

rm -f ecr_login.sh
