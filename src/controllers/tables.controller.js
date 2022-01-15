import { IndexesService } from 'services';
import { HTTP_CODE } from 'constants/enums';

export default {
    async getAll(req, res, next) {
        try {
            const body = await IndexesService.getAllIndexes();
            console.log('body', body);
            res.status(HTTP_CODE.OK).send({ body });
        } catch (err) {
            next(err);
        }
    },
    async getIndexByName(req, res, next) {
        try {
            const { index } = req.params
            const body = await IndexesService.getIndexByModelName(index);
            console.log('body', body);
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
            console.log({ err })
            next(err);
        }
    },
    async setFieldIndexStatus(req, res, next) {
        try {
            const { body: { model, field } } = req
            const body = await IndexesService.setFieldIndexStatus(model, field);
            console.log({ body })
            res.status(HTTP_CODE.OK).send(true);
        } catch (err) {
            console.log(' error in setFieldIndexStatus :  ', err)
            next(err);
        }
    },
    async deleteIndex(req, res, next) {
        try {
            const { index } = req.params
            const { body } = await IndexesService.deleteIndex(index);
            console.log('body', body);
            res.status(HTTP_CODE.OK).send({ body });
        } catch (err) {
            next(err);
        }
    },

    async importAll(req, res, next) {
        try {
            const { index } = req.params;
            const length = await IndexesService.importAll(index);
            res.status(HTTP_CODE.OK).send({ lengthOfImportedDocs: length });
        } catch (err) {
            next(err);
        }
    },
    async search(req, res, next) {
        try {
            const { index } = req.params;
            const { query } = req.query;
            const data = await IndexesService.search(String(index), String(query));
            console.log('result sent :', data.body.hits.hits)
            res.status(HTTP_CODE.OK).send(data.body.hits.hits);
        } catch (err) {
            console.log(err)
            if (err.meta.statusCode===HTTP_CODE.NOT_FOUND) {
                return res.status(HTTP_CODE.NOT_FOUND).send('index not found');
            }
            console.log('error in  search', err)
            next(err);
        }
    }

}
