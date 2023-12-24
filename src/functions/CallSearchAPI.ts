import axios from 'axios';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

export async function CallSearchAPI(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    const query = request.query.get('q') || (await request.text()) || 'error';
    const setLang = 'en-US'; //language support coming soon

    try {
        const keyVaultName = 'mentormolesecrets';
        const keyVaultUri = `https://${keyVaultName}.vault.azure.net`;
        const credential = new DefaultAzureCredential();

        const secretClient = new SecretClient(keyVaultUri, credential);

        //retrieve the Bing Web Search API key from the Key Vault
        const secretName = 'BingSearchAPIKey1';
        const apikeySecret = await secretClient.getSecret(secretName);

        const bingApiKey = apikeySecret.value;

        const bingApiEndpoint = 'https://api.bing.microsoft.com/v7.0/videos/search	';

        const response = await axios.get(bingApiEndpoint, {
            params: {
                q: query,
                setLang: setLang,
            },
            headers: {
                'Ocp-Apim-Subscription-Key': bingApiKey,
            },
        });

        //process the response from the Bing Web Search API
        const responseData = response.data;

        //modify the response to fit your needs
        const formattedResponse = {
            response: responseData,
            query: `${query}`,
        };

        return {
            body: JSON.stringify(formattedResponse),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        context.log(`Error calling Bing Web Search API: ${error.message}`);

        //provide a more specific error response
        return {
            status: 500, // Internal Server Error
            body: JSON.stringify({ error: 'Internal Server Error', errorMessage: error.message }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
}

app.http('CallSearchAPI', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: CallSearchAPI
});