#!/bin/bash
# ==========================================================
# Testing backend en AWS
# Author : Franco Barrientos <franco.barrientos@arzov.com>
# ==========================================================

sam="sam"

if [[ $ENV_SO == "windows" ]]
then
    sam="sam.cmd"
fi

# ----------------------------------------------------------
#  Generar template.yml
# ----------------------------------------------------------

chmod +x samtemplate.sh; ./samtemplate.sh
status=$?


# ----------------------------------------------------------
#  Levantar servicio AWS DynamoDB
# ----------------------------------------------------------

docker network create arzov-local-network
docker run --name aws-arzov -d -p 8000:8000 \
    --network arzov-local-network \
    --network-alias arzov \
    amazon/dynamodb-local \
    -jar DynamoDBLocal.jar \
    -inMemory -sharedDb

# Crear tablas
cd dynamodb/tables

declare -A tables=(
  [umt-001]=5
)

for table in "${!tables[@]}"
do
    ln="${tables[$table]}"
    cd $table
    awk "NR >= ${ln}" resource.yml > tmp.yml
    aws dynamodb create-table --cli-input-yaml file://tmp.yml --endpoint-url http://localhost:8000 --region localhost > null.log
    rm tmp.yml; rm null.log; cd ../
done

cd ../../


# ----------------------------------------------------------
#  Levantar servicio AWS Lambda
# ----------------------------------------------------------

# Instalar layers
cd lambda/layers

cd umt-ext/nodejs; npm install; cd ../../

cd ../../

params="
    ParameterKey=AWSDefaultRegion,ParameterValue=$AWS_DEFAULT_REGION
    ParameterKey=AWSS3WebBucket,ParameterValue=$AWS_S3_WEB_BUCKET
    ParameterKey=AWSR53UMTDomain,ParameterValue=$AWS_R53_UMT_DOMAIN
"
$sam local start-lambda --docker-network arzov-local-network -t template.yml \
    --parameter-overrides $params \
    --env-vars lambda/functions/env.json & pids="${pids-} $!"
status=$((status + $?))


# ----------------------------------------------------------
#  Pruebas AWS Lambda
# ----------------------------------------------------------

cd lambda/functions

lambdas="
    umt-add-user
    umt-add-team
    umt-add-teammember
    umt-add-teamchat
    umt-add-match
    umt-update-match
    umt-add-matchpatch
    umt-add-matchchat
    umt-add-stadium
    umt-add-court
    umt-get-user
    umt-update-user
    umt-near-teams
    umt-near-matches
    umt-list-teams
    umt-team-requests
    umt-teammember-requests
    umt-list-matches
    umt-match-requests
    umt-matchpatch-requests
"

for lambda in $lambdas
do
    cd $lambda; npm install; npm run test
    status=$((status + $?))
    cd ../
done

# Detener servicios
kill -9 $pids
docker kill aws-arzov
docker rm aws-arzov
docker network rm arzov-local-network

# Remover archivos temporales
cd ../../
rm template.yml
status=$((status + $?))

exit $status