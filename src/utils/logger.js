import winston from 'winston';
import { format } from 'logform';

const { printf } = format;

function stringifyError(err, filter, space) {
    const plainObject = {};
    Object.getOwnPropertyNames(err).forEach((key) => {
        plainObject[key] = err[key];
    });
    return JSON.stringify(plainObject, filter, space);
}

const customFormatter = printf(({
                                    level, message, timestamp,
                                }) => `${timestamp} ${level} ${message}`);

const winstonLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: format.combine(
                    format.timestamp(),
                    customFormatter,
            ),
        }),
    ],
});

class LoggerWrapper {
    /**
     * @param label - A label to show in which part log is occurred
     * @param message - A message. Can be either string or object
     * @param err - An required error object to be included in message.
     */
    static error(label, message, err) {
        const errormessage = err ? stringifyError(err):undefined;
        winstonLogger.log('error', `[${label.toUpperCase()}]: ${message}. ${err ? err.message:''}`, { message: errormessage });
    }

    /**
     * @param label - A label to show in which part log is occurred
     * @param message - A message. Can be either string or object
     * @param meta? - An optional object to be included in message.
     */
    static warn(label, message, meta) {
        winstonLogger.log('warn', `[${label.toUpperCase()}]: ${message}`, { message: JSON.stringify(meta) });
    }

    /**
     * @param label - A label to show in which part log is occurred
     * @param message - A message. Can be either string or object
     * @param meta? - An optional object to be included in message.
     */
    static info(label, message, meta) {
        winstonLogger.log('info', `[${label.toUpperCase()}]: ${message}`, { message: JSON.stringify(meta) });
    }

    /**
     * @param label - A label to show in which part log is occurred
     * @param message - A message. Can be either string or object
     * @param meta? - An optional object to be included in message.
     */
    static verbose(label, message, meta) {
        winstonLogger.log('verbose', `[${label.toUpperCase()}]: ${message}`, { message: JSON.stringify(meta) });
    }

    /**
     * @param label - A label to show in which part log is occurred
     * @param message - A message. Can be either string or object
     * @param meta? - An optional object to be included in message.
     */
    static debug(label, message, meta) {
        winstonLogger.log('debug', `[${label.toUpperCase()}]: ${message}`, { message: JSON.stringify(meta) });
    }

    /**
     * @param label - A label to show in which part log is occurred
     * @param message - A message. Can be either string or object
     * @param meta? - An optional object to be included in message.
     */
    static silly(label, message, meta) {
        winstonLogger.log('silly', `[${label.toUpperCase()}]: ${message}`, { message: JSON.stringify(meta) });
    }
}

export default LoggerWrapper;
