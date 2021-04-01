import dotenv from 'dotenv';

dotenv.config();

const configs = {
    apiPort: process.env.API_PORT || 3001,
    jwtSecretKey: process.env.JWTSECRETKEY || 'default',
    developerMode: process.env.NODE_ENV!=='production',
    mongodb: {
        host: process.env.MONGO_HOST || 'localhost:27017',
        name: process.env.MONGO_DATABASE || 'azmoon',
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
        get connectionString() {
            if (this.user && this.pass) {
                return `mongodb://${this.user}:${this.pass}@${this.host}/${this.name}`;
            }
            return `mongodb://${this.host}/${this.name}`;
        },
    },
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
    },
    mySql: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER,
        port: process.env.MYSQL_PORT,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB || 'azmoon',
    },
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    elasticBaseUrl: process.env.ELASTIC_BASE_URL || 'http://127.0.0.1:9200/',
    rabbit: {
        local: {
            protocol: process.env.RABBIT_POROTOCOL || 'amqp',
            userName: process.env.RABBIT_USERNAME,
            password: process.env.RABBIT_PASSWORD,
            hostName: process.env.RABBIT_HOSTNAME,
            port:Number (process.env.RABBIT_PORT),
            vHost: process.env.RABBIT_V_HOST,
        },
        queues:{
            local: process.env.RABBIT_LOCAL_QUEUE,
        }
    }
};

export default configs;
