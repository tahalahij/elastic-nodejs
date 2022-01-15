import SequelizeAuto from 'sequelize-auto';
import { Mysql } from "../connections";

const generator = new SequelizeAuto(Mysql, null, null, {
    dialect: 'mysql',
    directory: 'generatedModels',
    caseFile: 'l', // lowerCase model names
    // caseModel: 'p',
    // caseProp: 'c',
    language: 'es6',
    singularize: false,
});
// reads the model files generated in generatedModels folder and adds them to Sequelize,
// this functions returns models but models can be retrieved using Mysql.models too
export const initModels = async () => {
    const root = process.cwd();
    const { default: init } = await import(`${root}/generatedModels/init-models`);
    return init(Mysql);
}
export default generator
