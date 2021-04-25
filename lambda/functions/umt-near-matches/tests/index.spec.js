/**
 * Test: umt-near-matches
 * @author Franco Barrientos <franco.barrientos@arzov.com>
 */


// packages

const aws = require('aws-sdk');
const umtEnvs = require('../../../layers/umt-envs/nodejs/node_modules/umt-envs');
const events = require('../events/events.json');


// execution

describe('Test AWS Lambda: umt-near-matches', () => {

    let lambda = new aws.Lambda(umtEnvs.dev.LAMBDA_CONFIG);
    let params = { FunctionName: 'umt-near-matches' };


    // test 1

    test('Evaluate: Part 1', (done) => {

        params.Payload = JSON.stringify(events[0]);

        lambda.invoke(params, function (err, data) {

            // error

            if (err) {
                console.log(err);
                expect(err.StatusCode).toBe(400);
            }

            // success

            else {
                let response = JSON.parse(data.Payload);

                expect(data.StatusCode).toBe(200);
                expect(response.items).toStrictEqual([]);
                expect(response.nextToken).toBe(
                    '{"rangeKey":{"S":"MTCH#man.united"},"hashKey":{"S":"TM#fcbarcelona"},"geohash":{"S":"66jcfp"}}'
                );
            }

            done();
        });
    }, 60000);


    // test 2

    test('Evaluate: Parte 2', (done) => {

        params.Payload = JSON.stringify(events[1]);

        lambda.invoke(params, function (err, data) {

            // error

            if (err) {
                console.log(err);
                expect(err.StatusCode).toBe(400);
            }

            // success

            else {
                let response = JSON.parse(data.Payload);

                expect(data.StatusCode).toBe(200);
                expect(response.items[0].teamId1).toBe('man.united');
                expect(response.items[0].teamId2).toBe('realmadrid');
                expect(response.nextToken).toBe(
                    '{"rangeKey":{"S":"META#realmadrid"},"hashKey":{"S":"TM#realmadrid"},"geohash":{"S":"66jcfp"}}'
                );
            }

            done();
        });
    }, 60000);
});
