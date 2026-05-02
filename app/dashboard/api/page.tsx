import { getApiKeys } from './actions';
import ApiClient from './api-client';

export default async function ApiPage() {
    const apiKeys = await getApiKeys();
    return <ApiClient initialApiKeys={apiKeys} />;
}