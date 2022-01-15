import { ElasticSearch } from '../utils';
import { Thesis } from '../models/thesis.model.sql';

const index = 'thesis';

export default {
    async setIndex() {
        return ElasticSearch.setIndex({
            index,
            body: {
                mappings: {
                    "properties": {
                        title: {
                            type: 'text',
                        },
                    },
                },
            },
        });
    },

    async deleteIndex() {
        return ElasticSearch.deleteIndex({ index });
    },

    async deleteDoc(id) {
        return ElasticSearch.deleteDoc({ index, id });
    },

    async insert(id, title) {
        return ElasticSearch.insert({ index, id, body: { title } });
    },

    async getAll() {
        return ElasticSearch.getAll({ index });
    },

    async search(title) {
        return ElasticSearch.search({ index, query: title });
    },

};
