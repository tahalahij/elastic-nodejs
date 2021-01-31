import fs from 'fs';
import SequelizeAuto from 'sequelize-auto';
import { Mysql } from "../connections";
import { ElasticSearch } from "../utils";

const generator = new SequelizeAuto(Mysql, null, null, {
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
    async getFieldsOfModelToIndex(index) {
        const tables = await this.getTables()
        const indexOfModel = tables.findIndex(({ modelName }) => modelName===index)
        const fieldsToIndex = tables[indexOfModel].fields.map(({ indexed, fieldName }) => {
            if (indexed) {
                return fieldName
            }
        })
        console.log({ fieldsToIndex })
        return fieldsToIndex
    },
    async handleTriggerMessages(message) {
        const { model, document, type } = message
        switch (type) {
            case 'insert': {
                try {
                    const res = await ElasticSearch.getIndex({ index: model.trim() })
                    const fields = await this.getFieldsOfModelToIndex(model)
                    const body = fields.map((field) => {
                        if (document.hasOwnProperty(field)) {
                            return { [field]: document[field] }
                        }
                    })
                    console.log('body of doc inserted: ', body)
                    await ElasticSearch.insert({ index: model, id: document.id, body })
                    console.log({ res })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e)
                }
                break
            }
            case 'update': {
                try {
                    const res = await ElasticSearch.getIndex({ index: model.trim() })
                    const fields = await this.getFieldsOfModelToIndex(model)
                    const body = fields.map((field) => {
                        if (document.hasOwnProperty(field)) {
                            return { [field]: document[field] }
                        }
                    })
                    console.log('body of doc updated: ', body)
                    await ElasticSearch.update({ index: model, id: document.id, body })
                    console.log({ res })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e)
                }
                break
            }
            case 'delete': {
                try {
                    const res = await ElasticSearch.getIndex({ index: model.trim() })
                    await ElasticSearch.deleteDoc({ index: model, id: document.id })
                    console.log({ res })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e)
                }
                break
            }
            case 'default':
                console.log('undefined trigger type ,', { model, document, type })
        }
    }
}
