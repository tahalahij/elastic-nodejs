import fs from 'fs';
import { ElasticSearch, ModelGenerator, Types } from "../utils";

export default {
    async updateTablesList() {
        const data = await ModelGenerator.run()
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
        const fieldsToIndex = []
        tables[indexOfModel].fields.map(({ indexed, fieldName }) => {
            if (indexed) {
                fieldsToIndex.push(fieldName)
            }
        })
        console.log({ fieldsToIndex })
        return fieldsToIndex
    },
    async createIndexFromTable(index) {
        const tables = await this.getTables()
        const indexOfModel = tables.findIndex(({ modelName }) => modelName===index)
        const properties = {}
        tables[indexOfModel].fields.map(({ indexed, fieldName, value }) => {
            if (indexed) {
                properties[fieldName] = { type: Types.getElasticTypeFromMysqlType(value.type) }
            }
        })
        await ElasticSearch.createIndex({
            index,
            body: {
                "mappings": {
                    properties
                }
            }
        })

    },
    async handleTriggerMessages(message) {
        const { model, document, type } = message
        const index = model.trim()
        switch (type) {
            case 'insert': {
                try {
                    // check if index exists in elastic
                    const indexExists = await ElasticSearch.getIndex({ index })
                    console.log('indexExists:  ', !!indexExists)
                    const fields = await this.getFieldsOfModelToIndex(index)
                    console.log({ fields })
                    const body = {};
                    // create the insert object
                    fields.map((field) => {
                        if (document.hasOwnProperty(field)) {
                            body[field] = document[field]
                        }
                    })
                    if (!indexExists) {
                        await this.createIndexFromTable(index)
                    }
                    console.log(`body of doc to be ${type}ed: `)
                    console.log(body)
                    await ElasticSearch.insert({ index, id: document.id, body })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e.meta.body)
                }
                break
            }
            case 'update': {
                try {
                    // check if index exists in elastic
                    const indexExists = await ElasticSearch.getIndex({ index })
                    console.log('indexExists:  ', !!indexExists)
                    const fields = await this.getFieldsOfModelToIndex(index)
                    console.log({ fields })
                    const body = {};
                    // create the insert object
                    fields.map((field) => {
                        if (document.hasOwnProperty(field)) {
                            body[field] = document[field]
                        }
                    })
                    if (!indexExists) {
                        await this.createIndexFromTable(index)
                    }
                    console.log(`body of doc to be ${type}ed: `)
                    console.log(body)
                    await ElasticSearch.update({ index, id: document.id, body })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e.meta.body)
                }
                break
            }
            case 'delete': {
                try {
                    // check if index exists in elastic
                    const indexExists = await ElasticSearch.getIndex({ index })
                    if (indexExists) {
                        console.log(`doc with id ${document.id} being deleted`)
                        await ElasticSearch.deleteDoc({ index: model, id: document.id })
                    }
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e.meta.body)
                }
                break
            }
            case 'default':
                console.log('undefined trigger type ,', { model, document, type })
        }
    }
}
