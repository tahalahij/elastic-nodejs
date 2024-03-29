import { ElasticSearch } from '../connections';

export default {
    async setIndex({ index, body }) {
        return ElasticSearch.indices.put_mapping({ index, body });
    },
    async createIndex({ index, body }) {
        return ElasticSearch.indices.create({ index, body });
    },
    async getIndex({ index }) {
        try {
            return await ElasticSearch.indices.get({ index })
        } catch (e) {
            if (e.meta.statusCode===404) {
                return false
            }
        }

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
            body: {
                doc: body,
                doc_as_upsert: true
            },
        });
    },

    async getAll({ index }) {
        return ElasticSearch.search({ index });
    },

    async search({ index, query }) {
        return ElasticSearch.search({
            index,
            body: {
                "query": {
                    "query_string": {
                        query
                    }
                }
            }
        });
    },
};
