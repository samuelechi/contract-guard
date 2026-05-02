import { getApiKeys } from './actions';
import { getWebhooks } from './webhook-actions';
import ApiClient from './api-client';

export default async function ApiPage() {
    const [apiKeys, webhooks] = await Promise.all([
        getApiKeys(),
        getWebhooks(),
    ]);

    return <ApiClient initialApiKeys={apiKeys} initialWebhooks={webhooks} />;
}