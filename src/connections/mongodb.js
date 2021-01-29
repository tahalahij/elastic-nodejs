import bluebird from 'bluebird';
import mongoose from 'mongoose';
import config from '../config';

const { connectionString, replicaSet } = config.mongodb;
const LOG_LABEL = 'MONGODB_CONNECTION';

try {
    mongoose
            .connect(
                    connectionString,
                    {
                        connectTimeoutMS: 4000,
                        useNewUrlParser: true,
                        replicaSet,
                    },
            );
    /*
      .then(() => mongoose.connection.db.admin()
          .command({ setFeatureCompatibilityVersion: '4.0' }));
          */
} catch (error) {
    Logger.error(LOG_LABEL, 'Mongodb Connection Error: ', error);
}
mongoose.connection.on('connected', () => {
    // send ready message to pm2: if is to fix error when app is running without pm2
    if (process.send) {
        process.send('ready');
    }
});

mongoose.connection.on('error', (error) => {
    Logger.error(LOG_LABEL, 'Connection Error: ', error);
    throw new Error(`unable to connect to mongo db: ${connectionString}`);
});

mongoose.Promise = bluebird;

export default mongoose;
