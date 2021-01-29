import { Sequelize } from 'sequelize';
import config from '../config';

const { user, password, database } = config.mySql;
export default new Sequelize(database, user, password, {
    host: 'localhost',
    dialect: 'mysql',
});
