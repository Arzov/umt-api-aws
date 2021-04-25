/**
 * Get team's match requests
 * @author Franco Barrientos <franco.barrientos@arzov.com>
 */


// packages

const umtEnvs = require('umt-envs');
const aws = require('aws-sdk');
const dql = require('utils/dql');


// configurations

let options = umtEnvs.gbl.DYNAMODB_CONFIG;
let limitScan = umtEnvs.gbl.SCAN_LIMIT;

if (process.env.RUN_MODE === 'LOCAL') {
    options = umtEnvs.dev.DYNAMODB_CONFIG;
    limitScan = umtEnvs.dev.SCAN_LIMIT;
}

const dynamodb = new aws.DynamoDB(options);


// execution

exports.handler = (event, context, callback) => {

    const hashKey = `${umtEnvs.pfx.TEAM}${event.id}`;

    const ownerNextToken = event.nextToken
        ? event.nextToken.split('&')[0]
        : null;

    const guestNextToken = event.nextToken
        ? event.nextToken.split('&')[1]
        : null;

    dql.matchOwnerRequests(
        dynamodb,
        process.env.DB_UMT_001,
        hashKey,
        limitScan,
        ownerNextToken,

        function (err, data) {
            if (err) callback(err);
            else {
                let ownerNextTokenResult = null;
                let guestNextTokenResult = null;
                let ownerDataResult = [];
                let guestDataResult = [];

                if ('LastEvaluatedKey' in data)
                    ownerNextTokenResult = JSON.stringify(
                        data.LastEvaluatedKey
                    );

                if (data.Count) {
                    ownerDataResult = data.Items.map(function (x) {
                        return {
                            teamId1: x.hashKey.S.split('#')[1],
                            teamId2: x.rangeKey.S.split('#')[1],
                            reqStat: JSON.stringify(x.reqStat.M),
                        };
                    });
                }

                dql.matchGuestRequests(
                    dynamodb,
                    process.env.DB_UMT_001,
                    hashKey,
                    limitScan,
                    guestNextToken,

                    function (err, data) {
                        if (err) callback(err);
                        else {
                            if ('LastEvaluatedKey' in data)
                                guestNextTokenResult = JSON.stringify(
                                    data.LastEvaluatedKey
                                );

                            if (data.Count) {
                                guestDataResult = data.Items.map(function (x) {
                                    return {
                                        teamId1: x.hashKey.S.split('#')[1],
                                        teamId2: x.rangeKey.S.split('#')[1],
                                        reqStat: JSON.stringify(x.reqStat.M),
                                    };
                                });
                            }

                            ownerNextTokenResult = ownerNextTokenResult
                                ? ownerNextTokenResult
                                : '';
                            guestNextTokenResult = guestNextTokenResult
                                ? guestNextTokenResult
                                : '';

                            callback(null, {
                                items: ownerDataResult.concat(guestDataResult),
                                nextToken: `${ownerNextTokenResult}&${guestNextTokenResult}`,
                            });
                        }
                    }
                );
            }
        }
    );
};
