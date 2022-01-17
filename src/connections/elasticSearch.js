import { Client } from '@elastic/elasticsearch';
import config from 'config'

const client = new Client({
    node: config.elasticBaseUrl,
    maxRetries: 5,
    requestTimeout: 70000,
});

export default client;
