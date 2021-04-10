/**
 * Add a team
 * @author Franco Barrientos <franco.barrientos@arzov.com>
 */

const umtEnvs = require('umt-envs');
const umtUtils = require('umt-utils');
const aws = require('aws-sdk');
const dql = require('utils/dql');

let optionsDynamodb = umtEnvs.gbl.DYNAMODB_CONFIG;
let optionsLambda = umtEnvs.gbl.LAMBDA_CONFIG;

if (process.env.RUN_MODE === 'LOCAL') {
    optionsDynamodb = umtEnvs.dev.DYNAMODB_CONFIG;
    optionsLambda = umtEnvs.dev.LAMBDA_CONFIG;
}

const dynamodb = new aws.DynamoDB(optionsDynamodb);
const lambda = new aws.Lambda(optionsLambda);

exports.handler = function (event, context, callback) {
    const name = umtUtils.cleanName(event.name);
    const hashKey = `${umtEnvs.pfx.TEAM}${umtUtils.nameToId(name)}`;
    const rangeKey = `${umtEnvs.pfx.METADATA}${umtUtils.nameToId(name)}`;
    const picture = event.picture ? event.picture : umtEnvs.dft.TEAM.PICTURE;
    const ageMinFilter = String(event.ageMinFilter);
    const ageMaxFilter = String(event.ageMaxFilter);
    const matchFilter = event.matchFilter;
    const genderFilter = event.genderFilter;

    const formation = event.formation
        ? JSON.parse(event.formation)
        : umtEnvs.dft.TEAM.FORMATION;

    const geohash = event.geohash;
    const latitude = event.latitude;
    const longitude = event.longitude;

    const coords = {
        LON: { N: String(longitude) },
        LAT: { N: String(latitude) },
    };

    const createdOn = new Date().toISOString();

    let params = { FunctionName: 'umt-get-team' };

    params.Payload = JSON.stringify({
        id: umtUtils.nameToId(name),
    });

    lambda.invoke(params, function (err, data) {
        if (err) callback(err);
        else {
            const response = JSON.parse(data.Payload);
            const isEmpty = umtUtils.isObjectEmpty(response);

            if (!isEmpty) {
                const err = new Error(
                    JSON.stringify({
                        code: 'TeamExistException',
                        message: 'El equipo ya existe.',
                    })
                );
                callback(err);
            } else {
                dql.addTeam(
                    dynamodb,
                    process.env.DB_UMT_001,
                    hashKey,
                    rangeKey,
                    geohash,
                    name,
                    picture,
                    ageMinFilter,
                    ageMaxFilter,
                    matchFilter,
                    genderFilter,
                    formation,
                    coords,
                    createdOn,
                    callback
                );
            }
        }
    });
};
