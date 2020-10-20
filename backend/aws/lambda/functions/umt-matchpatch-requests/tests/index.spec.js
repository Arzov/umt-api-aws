const aws = require('aws-sdk')
const umtEnvs = require('../../../layers/umt-envs/nodejs/node_modules/umt-envs')
const event = require('../events/event.json')

describe('Test AWS Lambda: umt-matchpatch-requests', () => {

  let lambda = new aws.Lambda(umtEnvs.dev.LAMBDA_CONFIG)
  let params = {FunctionName: 'umt-matchpatch-requests'}

  test('Evaluar respuesta: Usuario (franco.barrientos@arzov.com)', (done) => {
    params.Payload = JSON.stringify(event)

    lambda.invoke(params, function(err, data) {
      if (err) {
        console.log(err)
        expect(err.StatusCode).toBe(200)
      } else {
        let response = JSON.parse(data.Payload)

        expect(data.StatusCode).toBe(200)
        expect(response.items[0].teamId1).toBe('chelsea')
        expect(response.items[0].teamId2).toBe('psg')
        expect(response.items[0].userEmail).toBe('franco.barrientos@arzov.com')
        expect(response.items[0].reqStat).toStrictEqual({MR: {S: 'A'}, PR: {S: 'P'}})
        expect(response.nextToken).toBe(null)
      }

      done()
    })
  }, 60000)
})