import { IndexesService } from '../services';
import elasticSearch from "../utils/elasticSearch";
import types from "../utils/Types";

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

        tables[indexOfModel].fields[indexOfField].indexed = true
        const type = types.get(tables[indexOfModel].fields[indexOfField].value.type)
        console.log('indexing : index:', index, ' field :', field, ' type,', type)
        await IndexesService.storeTables(tables);
        return elasticSearch.setIndex({
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


};
