const axios = require('axios');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    context.log('function running');
    try {
        const keyVaultName = 'mentormolesecrets';
        const secretName = 'BingSearchAPIKey1';

        //get the API key from Azure Key Vault using Managed Identity
        const credential = new DefaultAzureCredential();
        const secretClient = new SecretClient(`https://${keyVaultName}.vault.azure.net`, credential);
        const apiKey = await secretClient.getSecret(secretName);

        if (!secret || !secret.value) {
            throw new Error('Failed to retrieve API key from Azure Key Vault.');
        }

        //use the retrieved Bing API key
        const query = req.query.q || '';
        const response = await axios.get('https://api.bing.microsoft.com/bing/v7.0/videos/search', {
            params: { q: query },
            headers: { 'Ocp-Apim-Subscription-Key': apiKey.value },
        });

        //process the API response as needed
        const searchData = response.data;

        //respond with the search data in JSON format
        context.res = {
            status: 200,
            body: searchData,
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        //handle errors
        context.log.error('Error:', error.message);
        context.res = {
            status: error.response ? error.response.status : 500,
            body: { error: 'Internal Server Error' },
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
};
