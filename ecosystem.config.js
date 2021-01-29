module.exports = {
    apps: [{
        name: 'API',
        script: './build/src/api/app/app.js',
        kill_timeout: 4000,
        listen_timeout: 4000,
        wait_ready: true,
        instances: '2',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'staging',
        },
        env_production: {
            NODE_ENV: 'production',
        },
    }],
};
