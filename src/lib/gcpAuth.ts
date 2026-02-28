import { GoogleAuth } from 'google-auth-library';

let authClient: any = null;

export async function getAccessToken(): Promise<string> {
    if (!authClient) {
        const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT_JSON;

        if (serviceAccountJson) {
            // Vercel / production: use service account JSON from env var
            let credentials: any;
            try {
                credentials = JSON.parse(serviceAccountJson);
                // Vercel env vars may double-escape newlines. Ensure they are actual newlines.
                if (credentials.private_key) {
                    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
                }
            } catch {
                throw new Error('GCP_SERVICE_ACCOUNT_JSON is not valid JSON.');
            }
            authClient = new GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });
        } else {
            // Local dev: use Application Default Credentials (gcloud auth)
            authClient = new GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });
        }
    }
    const client = await authClient.getClient();
    const tokenInfo = await client.getAccessToken();
    return tokenInfo.token || '';
}
