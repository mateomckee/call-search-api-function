"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallSearchAPI = void 0;
const axios_1 = require("axios");
const functions_1 = require("@azure/functions");
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
const identity_1 = require("@azure/identity");
function CallSearchAPI(request, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = request.query.get('q') || (yield request.text()) || 'error';
        const setLang = 'en-US'; //language support coming soon
        try {
            const keyVaultName = 'mentormolesecrets';
            const keyVaultUri = `https://${keyVaultName}.vault.azure.net`;
            const credential = new identity_1.DefaultAzureCredential();
            const secretClient = new keyvault_secrets_1.SecretClient(keyVaultUri, credential);
            //retrieve the Bing Web Search API key from the Key Vault
            const secretName = 'BingSearchAPIKey1';
            const apikeySecret = yield secretClient.getSecret(secretName);
            const bingApiKey = apikeySecret.value;
            const bingApiEndpoint = 'https://api.bing.microsoft.com/v7.0/videos/search	';
            const response = yield axios_1.default.get(bingApiEndpoint, {
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
                bingApiResponse: responseData,
                message: `Your custom message for ${query}`,
            };
            return {
                body: JSON.stringify(formattedResponse),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }
        catch (error) {
            context.log(`Error calling Bing Web Search API: ${error.message}`);
            //provide a more specific error response
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error', errorMessage: error.message }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }
    });
}
exports.CallSearchAPI = CallSearchAPI;
functions_1.app.http('CallSearchAPI', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: CallSearchAPI
});
//# sourceMappingURL=CallSearchAPI.js.map