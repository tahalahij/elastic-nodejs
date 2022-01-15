import { ElasticSearch, ModelGenerator, initModels, Types } from "../utils";
import { Index } from "models";
import { Mysql } from "../connections";
import BBPromise from "bluebird";

export default {
    // generate/update the index model in mongodb based on the models in mysql database
    async syncModels() {
        const data = await ModelGenerator.run() // generates tables of all collections
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

        await initModels(); // add  generatedModels to Sequelize
    },
    async getIndexByModelName(modelName) {
        return Index.findOne({ modelName })
    },
    async getUpsertBody(index, document) {
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
        return body;
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
        const model = await this.getIndexByModelName(index);
        if (!model) {
            console.log(`could not find model for index :${index}`);
            return;
        }
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
                    const body = await this.getUpsertBody(index, document);
                    console.log('body of doc to be inserted: ')
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
                    const body = await this.getUpsertBody(index, document);
                    console.log('body of doc to be updated: ')
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
    // reads data from production mysql database and inserts them to elastic for that model
    // return number of docs inserted
    async importAll(index) {
        await this.createIndexFromModel(index);
        const modelName = String(index).toLowerCase();
        const model = await Mysql.model(modelName);

        const data = await model.findAll({ where: {} });
        console.log('from model :', index, ' found  #', data.length, 'docs in db and inserting ...');
        await BBPromise.map(data, ({ dataValues }) => {
                    console.log('inserting ', dataValues, 'into elastic');
                    return ElasticSearch.insert({
                        index, id: dataValues.id, body: dataValues
                    });
                }
                , { concurrency: 3 });
        return data.length;
    },
    async search(index, query) {
        return ElasticSearch.search({ index, query });
    },
    async deleteIndex(index) {
        return ElasticSearch.deleteIndex({ index });
    }
}
