import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function CallSearchAPI(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const query = request.query.get('q') || (await request.text()) || 'error';

    const response = {
        message: `${query}`
    };

    return {
        body: JSON.stringify(response),
        headers: {
            'Content-Type': 'application/json'
        }
    };
}

app.http('CallSearchAPI', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: CallSearchAPI
});
