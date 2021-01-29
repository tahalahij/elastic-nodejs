import expressValidation from 'express-validation';
import { HTTP_CODE } from '../constants/enums';
import config from '../config';

export default function (error, request, response, next) {
    if (config.developerMode) {
        return response.send(error);
    }
    if (error instanceof expressValidation.ValidationError) {
        return response.status(HTTP_CODE.BAD_REQUEST).send(error);
    }
    return response.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send(error);
}
