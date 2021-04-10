/**
 * Queries on AWS DynamoDB
 * @author Franco Barrientos <franco.barrientos@arzov.com>
 */

/**
 * Create a match
 * @param {Object} db DynamoDB client
 * @param {String} tableName Table name
 * @param {String} hashKey Applicant team id
 * @param {String} rangeKey Requested team id
 * @param {String} createdOn Creation date
 * @param {String} expireOn Due date
 * @param {Object} patches Allowed patches
 * @param {String[]} positions Positions required for patch
 * @param {String} ageMinFilter Min. players age
 * @param {String} ageMaxFilter Max. players age
 * @param {String[]} matchFilter Match type
 * @param {String} schedule Match date
 * @param {Object} reqStat Request status
 * @param {String} geohash Geolocation hash
 * @param {Object} coords Location coordinates
 * @param {String} stadiumGeohash Sport club geolocation hash
 * @param {String} stadiumId Sport club id
 * @param {String} courtId Court id
 * @param {String[]} genderFilter Gender of players
 * @param {String} GSI1PK Requested team id
 * @param {String} GSI1SK Applicant team id
 * @param {Function} fn Callback
 */
const addMatch = (
    db,
    tableName,
    hashKey,
    rangeKey,
    createdOn,
    expireOn,
    patches,
    positions,
    ageMinFilter,
    ageMaxFilter,
    matchFilter,
    schedule,
    reqStat,
    geohash,
    coords,
    stadiumGeohash,
    stadiumId,
    courtId,
    genderFilter,
    GSI1PK,
    GSI1SK,
    fn
) => {
    db.putItem(
        {
            TableName: tableName,
            Item: {
                hashKey: { S: hashKey },
                rangeKey: { S: rangeKey },
                createdOn: { S: createdOn },
                expireOn: { S: expireOn },
                patches: { M: patches },
                positions: { SS: positions },
                ageMinFilter: { N: ageMinFilter },
                ageMaxFilter: { N: ageMaxFilter },
                matchFilter: { SS: matchFilter },
                schedule: { S: schedule },
                reqStat: { M: reqStat },
                geohash: { S: geohash },
                coords: { M: coords },
                stadiumGeohash: { S: stadiumGeohash },
                stadiumId: { S: stadiumId },
                courtId: { N: courtId },
                genderFilter: { SS: genderFilter },
                GSI1PK: { S: GSI1PK },
                GSI1SK: { S: GSI1SK },
            },
        },
        function (err, data) {
            if (err) fn(err);
            else
                fn(null, {
                    teamId1: hashKey.split('#')[1],
                    teamId2: rangeKey.split('#')[1],
                    createdOn,
                    expireOn,
                    patches: JSON.stringify(patches),
                    positions,
                    ageMinFilter,
                    ageMaxFilter,
                    matchFilter,
                    schedule: schedule,
                    reqStat: JSON.stringify(reqStat),
                    geohash,
                    coords: JSON.stringify(coords),
                    stadiumGeohash,
                    stadiumId,
                    courtId,
                    genderFilter,
                });
        }
    );
};

module.exports.addMatch = addMatch;
