import { LOG_LABELS } from 'constants/enums';
import Promise from 'bluebird';
import express from 'express';
import { errorHandler } from 'middlewares';
import { expressLoader } from './loaders';
import { Logger } from './utils';
import routes from './routes';
import config from './config';

global.Promise = Promise;

function start() {
    const app = express();
    app.set('trust proxy', 1);
    app.set('port', config.apiPort);

    expressLoader({ app });
    app.use(routes);
    app.use(errorHandler);

    app.listen(app.get('port'), () => {
        Logger.info(
                LOG_LABELS.APP_START,
                `🔥 App is running at http://localhost:${app.get('port')}`,
        );
    });
    return app;
}

export default start();
