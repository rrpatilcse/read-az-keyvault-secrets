let secretClient = require('read-azure-secrets');

async function loadKeyVaultValues() {

    let applicationID = '';
    let applicationSecret = '';
    let vaultURL = 'https://<your-key-vault-name>.vault.azure.net/';
    let secrets = await secretClient.getSecrets(applicationID, applicationSecret, vaultURL);

    secrets.forEach(secret => {
        console.log(secret);
    });

}

loadKeyVaultValues();
