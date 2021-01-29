import { Router } from 'express';
import thesisRoutes from './thesis.routes';
import tablesRoutes from './tables.routes';
import { startThesisQueue } from "../queues";
import { ElasticSearch } from "../connections";

const router = Router();

router.get('/', (req, res) => res.render('search', { baseUrl: 'http://localhost:3001/' }));
router.get('/startrabbit', async (req, res) => {
    try {
        await startThesisQueue()
        res.send('started')
    } catch (e) {
        res.send(e)
    }
})
router.use(
        '/api/v1/thesis',
        thesisRoutes,
);
router.use(
        '/api/v1/tables',
        tablesRoutes,
);
router.use(
        '/test',
        async (req, res) => {
            const x = await ElasticSearch.getIndex({ index: 'article' })
            res.send({ x })
        },
);

export default router;
