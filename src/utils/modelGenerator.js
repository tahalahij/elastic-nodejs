import SequelizeAuto from 'sequelize-auto';
import { Mysql } from "../connections";

const generator = new SequelizeAuto(Mysql, null, null, {
    dialect: 'mysql',
    directory: 'generatedModels',
    // caseFile: 'l',
    // caseModel: 'p',
    // caseProp: 'c',
    language: 'es6',
    singularize: false,
});
export default generator
