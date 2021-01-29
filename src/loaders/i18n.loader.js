import i18n from 'i18n';
import path from 'path';

export default function ({ app }) {
    i18n.configure({
        locales: ['fa'],
        defaultLocale: 'fa',
        queryParameter: 'lang',
        directory: path.join(__dirname, '../locales'),
        register: global,
        indent: '  ',
        api: {
            __: 'translate',
        },
    });

    app.use(i18n.init);

    return app;
}
