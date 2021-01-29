import { TablesService } from '../services';
import { HTTP_CODE } from '../constants/enums';

export default {
    async getAll(req, res, next) {
        try {
            const body = await TablesService.getAll();
            console.log('body', body);
            res.status(HTTP_CODE.OK).send({ body });
        } catch (err) {
            res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
        }
    },
    async updateTablesList(req, res, next) {
        try {
            await TablesService.updateTablesList();
            res.status(HTTP_CODE.OK).send("updated");
        } catch (err) {
            res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
        }
    },
    async index(req, res, next) {
        try {
            const { body: { model, field } } = req
            const body = await TablesService.index(model, field);
            res.status(HTTP_CODE.OK).send(body);
        } catch (err) {
            console.log({ err })
            res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
        }
    },

}
