import { ElasticSearch } from '../connections';

export default {
    async setIndex({ index, body }) {
        return ElasticSearch.indices.put_mapping({ index, body });
    },
    async getIndex({ index }) {
        return ElasticSearch.indices.get({ index});
    },

    async deleteIndex({ index }) {
        return ElasticSearch.indices.delete({ index });
    },

    async deleteDoc({ index, id }) {
        return ElasticSearch.delete({ index, id });
    },

    async insert({ index, id, body = {} }) {
        return ElasticSearch.create({
            index,
            id,
            body,
        });
    },
    async update({ index, id, body = {} }) {
        return ElasticSearch.update({
            index,
            id,
            body,
        });
    },

    async getAll({ index }) {
        return ElasticSearch.search({ index });
    },

    async search({ index, query }) {
        return ElasticSearch.search({
            index,
            body:{
                "query": {
                    "query_string": {
                        query
                    }
                }
            }
        });
    },
};
