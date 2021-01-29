import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: 'http://localhost:9200',
    maxRetries: 5,
    requestTimeout: 70000,
});

export default client;
