import { Sequelize } from 'sequelize';
import config from '../config';

const { user, password, database, host, port } = config.mySql;
console.log(' mysql connection config', { user, password, database, host })
export default new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
});
