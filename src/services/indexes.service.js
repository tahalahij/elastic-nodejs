import { ElasticSearch, ModelGenerator, initModels, Types, Logger } from "../utils";
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
        Logger.debug('INDEXES_SERVICE:getUpsertBody', 'indexExists', { indexExists });
        const fields = await this.getFieldsOfModelToIndex(index)
        Logger.debug('INDEXES_SERVICE:getUpsertBody', 'fields', { fields });
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
            Logger.debug('INDEXES_SERVICE:getFieldsOfModelToIndex', '!model', { modelName });
            model = await this.syncModels()
            model = await this.getIndexByModelName(modelName)
        }
        const fieldsToIndex = []
        model.fields.map(({ indexed, fieldName }) => {
            if (indexed) {
                fieldsToIndex.push(fieldName)
            }
        })
        Logger.debug('INDEXES_SERVICE:getFieldsOfModelToIndex', 'fieldsToIndex', { fieldsToIndex });
        return fieldsToIndex
    },
    async createIndexFromModel(index) {
        const model = await this.getIndexByModelName(index);
        if (!model) {
            Logger.error('INDEXES_SERVICE:createIndexFromModel', '!model', { index });
            console.log(`could not find model for index :${index}`);
            return;
        }
        const properties = {}
        model.fields.map(({ indexed, fieldName, type }) => {
            if (indexed) {
                properties[fieldName] = { type: Types.getElasticTypeFromMysqlType(type) }
            }
        })
        Logger.debug('INDEXES_SERVICE:createIndexFromModel', 'createIndex', { properties });
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
                    Logger.debug('INDEXES_SERVICE:handleTriggerMessages', 'insert', { body });
                    await ElasticSearch.insert({ index, id: document.id, body })
                } catch (e) {
                    Logger.error('INDEXES_SERVICE:handleTriggerMessages',
                            `insert: index for model ${model.trim()} does not exists `, e);
                }
                break
            }
            case 'update': {
                try {
                    // check if index exists in elastic
                    const body = await this.getUpsertBody(index, document);
                    Logger.debug('INDEXES_SERVICE:handleTriggerMessages', 'update', { body });
                    await ElasticSearch.update({ index, id: document.id, body })
                } catch (e) {
                    Logger.error('INDEXES_SERVICE:handleTriggerMessages',
                            `update: index for model ${model.trim()} does not exists `, e);
                }
                break
            }
            case 'delete': {
                try {
                    // check if index exists in elastic
                    const indexExists = await ElasticSearch.getIndex({ index })
                    if (indexExists) {
                        Logger.debug('INDEXES_SERVICE:handleTriggerMessages',
                                `doc being deleted `, { index, id: document.id });
                        await ElasticSearch.deleteDoc({ index: model, id: document.id })
                    }
                } catch (e) {
                    Logger.error('INDEXES_SERVICE:handleTriggerMessages',
                            `delete`, e);
                }
                break
            }
            case 'default':
                Logger.error('INDEXES_SERVICE:handleTriggerMessages',
                        'default: undefined trigger type ', { model, document, type });
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
        Logger.debug('INDEXES_SERVICE:setFieldIndexStatus', 'indexing field', {
            modelField,
            field,
            type,
            index,
            indexExists
        })
        // is this the field of the model that is being indexed? if so create the index first
        if (!indexExists) {
            Logger.debug('INDEXES_SERVICE:setFieldIndexStatus', '!indexExists', { index })
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
    async getAllElasticIndexes() {
        const data = await ElasticSearch.cat.indices({ format: "JSON" });
        return data.body.map(i => i.index).filter(i => i[0]!=='.') // elastic config indexes start with "."
    },
    // reads data from production mysql database and inserts them to elastic for that model
    // return number of docs inserted
    async importAll(index) {
        Logger.debug('INDEXES_SERVICE:importAll', 'start', { index })
        await this.createIndexFromModel(index);
        const modelName = String(index).toLowerCase();
        const model = await Mysql.model(modelName);

        const data = await model.findAll({ where: {} });

        Logger.debug('INDEXES_SERVICE:importAll', 'inserting', { index, length: data.length })
        await BBPromise.map(data, async ({ dataValues }) => {
                    await ElasticSearch.update({
                        index, id: dataValues.id, body: dataValues
                    });
                    Logger.debug('INDEXES_SERVICE:importAll', 'inserted doc with id', { index, id: dataValues.id, })
                }
                , { concurrency: 3 });
        Logger.debug('INDEXES_SERVICE:importAll', 'done ', { index, length: data.length })
        return data.length;
    },
    async search(index, query) {
        return ElasticSearch.search({ index, query });
    },
    async deleteIndex(index) {
        return ElasticSearch.deleteIndex({ index });
    }
}
