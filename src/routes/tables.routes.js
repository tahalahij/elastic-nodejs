import { Router } from 'express';
import { TablesController } from '../controllers';

const router = Router();

router.get(
        '/all',
        TablesController.getAll,
);
router.get(
        '/updateTables',
        TablesController.updateTablesList,
);
router.post(
        '/index',
        TablesController.index,
);

export default router;
