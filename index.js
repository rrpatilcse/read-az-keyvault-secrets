'use strict';
const KeyVault = require('azure-keyvault');
const AdalNode = require('adal-node');

let clientID = '';
let clientSecret = '';

/**
 * Get all secrets from azure key vault
 *
 * @param {*} appClientID - Application client ID
 * @param {*} appClientSecret - Application client secret 
 * @param {*} keyVaultURL - Azure key vault URL
 */
async function getSecrets(appClientID, appClientSecret, keyVaultURL) {
    try {
        clientID = appClientID;
        clientSecret = appClientSecret;

        var credentials = new KeyVault.KeyVaultCredentials(secretAuthenticator);
        var client = new KeyVault.KeyVaultClient(credentials);
        //Get secrete tokens from azure key vault. 
        //It returns only secrete id, not value of secrete.
        //At a time it returns 25 secret tokens
        let tokens = await client.getSecrets(keyVaultURL);
        let secretTokens = tokens;
        let nextLink = tokens.nextLink || undefined;
        let skip = 25;
        while (nextLink) {
            nextLink = nextLink.split('$').join(`${encodeURIComponent('$')}`);
            nextLink = `${nextLink}&skip=${skip}`;
            tokens = await client.getSecrets(nextLink);
            if (tokens) {
                secretTokens = secretTokens.concat(tokens);
                nextLink = tokens.nextLink || undefined;
                skip += 25;
            }
        }
        let getVersionPromises = [];
        for (let index in secretTokens) {
            if (secretTokens[index]['id']) {
                let secretDetails = KeyVault.parseSecretIdentifier(secretTokens[index]['id']);
                let pGetVersion = client.getSecretVersions(secretDetails['vault'], secretDetails['name']);
                getVersionPromises.push(pGetVersion);
            }
        }
        //To get secrete value we need version of secrete.
        let secretVersions = await Promise.all(getVersionPromises);
        let getSecretPromises = [];
        for (let index = 0; index < secretVersions.length; index++) {
            let activeVersion = secretVersions[index].filter((version) => {
                if (version['attributes']['enabled'] === true) {
                    return version;
                }
            });
            if (activeVersion && activeVersion.length > 0 && activeVersion[0]['id']) {
                let secretDetails = KeyVault.parseSecretIdentifier(activeVersion[0]['id']);
                let pGetSecret = client.getSecret(secretDetails['vault'], secretDetails['name'], secretDetails['version'], null);
                getSecretPromises.push(pGetSecret);
            }
        }
        return await Promise.all(getSecretPromises);

    } catch (error) {
        throw error;
    }
}


function secretAuthenticator(challenge, callback) {
    var context = new AdalNode.AuthenticationContext(challenge.authorization);
    return context.acquireTokenWithClientCredentials(
        challenge.resource,
        clientID,
        clientSecret,
        function (err, tokenResponse) {
            if (err) {
                throw err;
            }
            var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
            return callback(null, authorizationValue);
        });
}

module.exports = {
    getSecrets
}
