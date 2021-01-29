import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import helmet from 'helmet';

export default function ({ app }) {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.set('view engine', 'ejs');
    app.use(helmet());

    return app;
}
