import { ThesisService } from '../services';
import { HTTP_CODE } from '../constants/enums';

async function setIndex(req, res, next) {
    try {
        const { body } = await ThesisService.setIndex();
        console.log('body', body);
        res.status(HTTP_CODE.OK).send({ body });
    } catch (err) {
        res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
    }
}

async function deleteIndex(req, res, next) {
    try {
        const { body } = await ThesisService.deleteIndex();
        console.log('body', body);
        res.status(HTTP_CODE.OK).send({ body });
    } catch (err) {
        res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
    }
}

async function insert(req, res, next) {
    try {
        const { id, title } = req.body;

        const { body } = await ThesisService.insert(id, title);
        console.log({ body })
        res.status(HTTP_CODE.OK).send({ body });
    } catch (err) {
        res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
    }
}

async function getAll(req, res, next) {
    try {
        const { body } = await ThesisService.getAll();
        console.log({ body })
        res.status(HTTP_CODE.OK).send({ body });
    } catch (err) {
        res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
    }
}

async function search(req, res, next) {
    try {
        const { title } = req.query;
        const { body } = await ThesisService.search(String(title));
        console.log({ body })
        res.status(HTTP_CODE.OK).send({ thesis: body.hits.hits });
    } catch (err) {
        res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
    }
}

async function importAll(req, res, next) {
    try {
        const thesis = await ThesisService.importAll();
        res.status(HTTP_CODE.OK).send({ thesis });
    } catch (err) {
        res.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ err });
    }
}

export default {
    setIndex, deleteIndex, search, insert, getAll, importAll,
};
