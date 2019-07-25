# read-azure-secrets


This reads all secrets from the azure key vault. 
It returns only enabled secrets if more than one secret versions are available.
Authenticate application by client ID and client secret & use your key vault URI to read secrets.


## Installing

```
npm i read-azure-secrets
```

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Example

```
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
```

## Authors

* **Rahul Patil**

See also the list of [contributors](https://github.com/rrpatilcse/read-az-keyvault-secrets/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
