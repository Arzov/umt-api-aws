/**
 * Get a team member
 * @author Franco Barrientos <franco.barrientos@arzov.com>
 */

const umtEnvs = require('umt-envs');
const aws = require('aws-sdk');
const dql = require('utils/dql');

let options = umtEnvs.gbl.DYNAMODB_CONFIG;

if (process.env.RUN_MODE === 'LOCAL') options = umtEnvs.dev.DYNAMODB_CONFIG;

const dynamodb = new aws.DynamoDB(options);

exports.handler = (event, context, callback) => {
    const hashKey = `${umtEnvs.pfx.TEAM}${event.teamId}`;
    const rangeKey = `${umtEnvs.pfx.TEAM_MEMBER}${event.email}`;

    dql.getTeamMember(
        dynamodb,
        process.env.DB_UMT_001,
        hashKey,
        rangeKey,
        callback
    );
};
