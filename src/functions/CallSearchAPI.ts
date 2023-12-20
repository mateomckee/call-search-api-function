import axios from 'axios';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

export async function CallSearchAPI(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const query = request.query.get('q') || (await request.text()) || 'error';

    try {
        // Create an instance of the SecretClient class from @azure/keyvault-secrets
        const keyVaultName = 'mentormolesecrets';
        const keyVaultUri = `https://${keyVaultName}.vault.azure.net`;
        const credential = new DefaultAzureCredential();

        const secretClient = new SecretClient(keyVaultUri, credential);

        // Retrieve the Bing Web Search API key from Key Vault
        const secretName = 'searchApiKey';
        const apikeySecret = await secretClient.getSecret(secretName);

        const bingApiKey = apikeySecret.value;

        // Use the API key in the Bing Web Search API call
        const bingApiEndpoint = 'https://api.cognitive.microsoft.com/bing/v7.0/search';

        const response = await axios.get(bingApiEndpoint, {
            params: {
                q: query,
            },
            headers: {
                'Ocp-Apim-Subscription-Key': bingApiKey,
            },
        });

        // Process the response from the Bing Web Search API
        const responseData = response.data;

        // Modify the response to fit your needs
        const formattedResponse = {
            bingApiResponse: responseData,
            message: `Your custom message for ${query}`,
        };

        return {
            body: JSON.stringify(formattedResponse),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        context.log(`Error calling Bing Web Search API: ${error.message}`);

        // Provide a more specific error response
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