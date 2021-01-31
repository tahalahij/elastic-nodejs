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

    async importAll() {
        const data = await Thesis.findAll();
        console.log('#', data.length, ' thesis found in db and inserting ...');
        console.log('data :', data);
        return Promise.all(data.map(({ dataValues }) => {
            console.log('inserting ',  dataValues , 'into elastic');
            return this.insert(dataValues.id, dataValues.title);
        }));
    },
};
