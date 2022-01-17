import { Router } from 'express';
import tablesRoutes from './tables.routes';
import { startTriggerQueue } from "../queues";

const router = Router();

// router.get('/', (req, res) => res.render('search', { baseUrl: 'http://localhost:3001/' }));
router.get('/', (req, res) => res.redirect('http://localhost:3000/search'));
router.get('/api/v1/startrabbit', async (req, res) => {
    try {
        await startTriggerQueue()
        res.send('Rabbit Started')
    } catch (e) {
        res.send(e)
    }
})
router.use(
        '/api/v1/tables',
        tablesRoutes,
);

export default router;
