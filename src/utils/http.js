import http from 'axios';
import config from '../config';

const { elasticBaseUrl } = config;
const instance = http.create({
    baseURL: elasticBaseUrl,
});
export default instance;
