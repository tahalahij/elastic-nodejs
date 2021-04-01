import { ElasticSearch, ModelGenerator, Types } from "../utils";
import { Index } from "models";

export default {
    // generate/update the index model in mongodb based on the models in mysql database
    async syncModels() {
        console.log(555)
        const data = await ModelGenerator.run() // generates tables of all collections
        console.log(22222222, { data })
        Object.keys(data.tables).map(async (modelName) => {
            const model = await Index.findOne({ modelName })
            if (model) { // update existing model
                Object.keys(data.tables[modelName]).map((field) => {
                    if (!model.fields.find((f) => f.fieldName===field)) { // add filed to the document for this model
                        model.fields.push({
                            fieldName: field,
                            indexed: false,
                            type: data.tables[modelName][field].type
                        })
                    }
                })
                await model.save()
            } else { // create model
                const newModel = { modelName, fields: [] }
                Object.keys(data.tables[modelName]).map((field) => {
                    newModel.fields.push({ fieldName: field, indexed: false, type: data.tables[modelName][field].type })
                })
                await Index.create(newModel)
            }
        })
    },
    async getIndexByModelName(modelName) {
        return Index.findOne({ modelName })
    },
    async getFieldsOfModelToIndex(modelName) {
        let model = await this.getIndexByModelName(modelName)
        if (!model) {
            model = await this.syncModels()
            model = await this.getIndexByModelName(modelName)
        }
        const fieldsToIndex = []
        model.fields.map(({ indexed, fieldName }) => {
            if (indexed) {
                fieldsToIndex.push(fieldName)
            }
        })
        console.log({ fieldsToIndex })
        return fieldsToIndex
    },
    async createIndexFromModel(index) {
        const model = await this.getIndexByModelName(index)
        const properties = {}
        model.fields.map(({ indexed, fieldName, type }) => {
            if (indexed) {
                properties[fieldName] = { type: Types.getElasticTypeFromMysqlType(type) }
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
                        await this.createIndexFromModel(index)
                    }
                    console.log(`body of doc to be ${type}ed: `)
                    console.log(body)
                    await ElasticSearch.insert({ index, id: document.id, body })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e)
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
                        await this.createIndexFromModel(index)
                    }
                    console.log(`body of doc to be ${type}ed: `)
                    console.log(body)
                    await ElasticSearch.update({ index, id: document.id, body })
                } catch (e) {
                    console.log(` index for model ${model.trim()} does not exists : error :`, e)
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
                    console.log(` index for model ${model.trim()} does not exists : error :`, e)
                }
                break
            }
            case 'default':
                console.log('undefined trigger type ,', { model, document, type })
        }
    },
    async setFieldIndexStatus(index, field, indexed = true) {
        const model = await this.getIndexByModelName(index)
        const modelField = model.fields.find(f => f.fieldName===field)
        //if any field has been indexed then the model has been indexed before and now is being updated
        const indexExists = await ElasticSearch.getIndex({ index })
        modelField.indexed = indexed
        await model.save()
        const type = Types.getElasticTypeFromMysqlType(modelField.type)
        console.log(' modelField, ', modelField)
        console.log('indexing : index:', index, ' field :', field, ' type,', type, 'indexExists', !!indexExists)
        // is this the field of the model that is being indexed? if so create the index first
        if (!indexExists) {
            await this.createIndexFromModel(index)
        } else {
            return ElasticSearch.setIndex({
                index,
                body: {
                    "properties": {
                        [field]: {
                            type
                        }
                    }
                }
            })
        }
    },
    async getAllIndexes() {
        return Index.find({})
    },
    async search(index, query) {
        return ElasticSearch.search({ index, query });
    }, async deleteIndex(index) {
        return ElasticSearch.deleteIndex({ index });
    }
}
