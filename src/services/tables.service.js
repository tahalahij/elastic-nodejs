import { IndexesService } from '../services';
import { ElasticSearch, Types } from "../utils";

export default {
    async getAll() {
        return IndexesService.getTables()
    },
    async updateTablesList() {
        return IndexesService.updateTablesList()
    },
    async setFieldIndexStatus(index, field) {
        const tables = await IndexesService.getTables();
        const indexOfModel = tables.findIndex(({ modelName }) => modelName===index)
        const indexOfField = tables[indexOfModel].fields.findIndex(({ fieldName }) => fieldName===field)
        console.log('field found type', tables[indexOfModel].fields[indexOfField].value.type)
        //if any filed has been indexed then the model has been indexed before and now is being updated
        const indexExists =  await ElasticSearch.getIndex({ index })
        tables[indexOfModel].fields[indexOfField].indexed = true
        console.log('tables[indexOfModel].fields[indexOfField]:', tables[indexOfModel].fields[indexOfField], ' indexOfField :', indexOfField, ' indexOfModel,', indexOfModel)
        const type = Types.getElasticTypeFromMysqlType(tables[indexOfModel].fields[indexOfField].value.type)
        console.log('indexing : index:', index, ' field :', field, ' type,', type, 'indexExists', !!indexExists)
        await IndexesService.storeTables(tables);
        // is this the field of the model that is being indexed? if so create the index first
        if (!indexExists) {
            await IndexesService.createIndexFromTable(index)
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
    async search(index, query) {
        return ElasticSearch.search({ index, query });
    }
    , async deleteIndex(index) {
        return ElasticSearch.deleteIndex({ index });
    }
}

