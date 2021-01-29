import fs from 'fs';
import SequelizeAuto from 'sequelize-auto';
import sequelize from '../connections/mysql';
import types from '../utils/Types';

const generator = new SequelizeAuto(sequelize, null, null, {
    dialect: 'mysql',
    directory: 'generatedModels',
    // caseFile: 'l',
    // caseModel: 'p',
    // caseProp: 'c',
    language: 'es6',
    singularize: false,
});

export default {
    async updateTablesList() {
        const data = await generator.run()
        const tables = Object.keys(data.tables).map((k) => {
            return {
                modelName: k, fields: Object.keys(data.tables[k]).map((field) => {
                            return { fieldName: field, indexed: false, value: data.tables[k][field] }
                        }
                )
            }
        })
        await this.storeTables(tables)
    },
    async getTables() {
        const file = await fs.readFileSync('tables.json')
        return JSON.parse(file)
    },
    async storeTables(tables) {
        await fs.writeFileSync('tables.json', JSON.stringify(tables, null, 2))
    },
}
