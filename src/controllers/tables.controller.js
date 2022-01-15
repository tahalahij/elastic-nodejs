import { IndexesService } from 'services';
import { HTTP_CODE } from 'constants/enums';
import { Logger } from "utils";

export default {
    async getAll(req, res, next) {
        try {
            const body = await IndexesService.getAllIndexes();
            Logger.debug('TABLES_CONTROLLER:getAllIndexes', 'body', body);
            res.status(HTTP_CODE.OK).send({ body });
        } catch (err) {
            next(err);
        }
    },
    async getIndexByName(req, res, next) {
        try {
            const { index } = req.params
            const body = await IndexesService.getIndexByModelName(index);
            Logger.debug('TABLES_CONTROLLER:getIndexByModelName', 'body', body);
            res.status(HTTP_CODE.OK).send({ body });
        } catch (err) {
            next(err);
        }
    },
    async syncModels(req, res, next) {
        try {
            await IndexesService.syncModels();
            res.status(HTTP_CODE.OK).send("updated");
        } catch (err) {
            Logger.debug('TABLES_CONTROLLER', 'syncModels', err)
            next(err);
        }
    },
    async setFieldIndexStatus(req, res, next) {
        try {
            const { body: { model, field } } = req
            const body = await IndexesService.setFieldIndexStatus(model, field);
            Logger.debug('TABLES_CONTROLLER:setFieldIndexStatus', { body })
            res.status(HTTP_CODE.OK).send(true);
        } catch (err) {
            Logger.debug('TABLES_CONTROLLER', 'setFieldIndexStatus', err)
            next(err);
        }
    },
    async deleteIndex(req, res, next) {
        try {
            const { index } = req.params
            const { body } = await IndexesService.deleteIndex(index);
            Logger.debug('TABLES_CONTROLLER:deleteIndex', 'body', body);
            res.status(HTTP_CODE.OK).send({ body });
        } catch (err) {
            next(err);
        }
    },

    async importAll(req, res, next) {
        try {
            const { index } = req.params;
            const length = await IndexesService.importAll(index);
            Logger.debug('TABLES_CONTROLLER:importAll', 'length', length);
            res.status(HTTP_CODE.OK).send({ lengthOfImportedDocs: length });
        } catch (err) {
            Logger.error('TABLES_CONTROLLER', 'importAll', err);
            next(err);
        }
    },
    async search(req, res, next) {
        try {
            const { index } = req.params;
            const { query } = req.query;
            const data = await IndexesService.search(String(index), String(query));
            Logger.debug('TABLES_CONTROLLER:search', 'search result sent :', data.body.hits.hits)
            res.status(HTTP_CODE.OK).send(data.body.hits.hits);
        } catch (err) {
            Logger.error('TABLES_CONTROLLER', 'search', err)
            if (err.meta.statusCode===HTTP_CODE.NOT_FOUND) {
                return res.status(HTTP_CODE.NOT_FOUND).send('index not found');
            }
            next(err);
        }
    }

}
