import { GoogleAuth } from 'google-auth-library';

let authClient: any = null;

export async function getAccessToken(): Promise<string> {
    if (!authClient) {
        authClient = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
    }
    const client = await authClient.getClient();
    const tokenInfo = await client.getAccessToken();
    return tokenInfo.token || '';
}
