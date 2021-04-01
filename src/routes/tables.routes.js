import { Router } from 'express';
import { TablesController } from 'controllers';

const router = Router();

router.get(
        '/',
        TablesController.getAll,
);
router.get(
        '/updateTables',
        TablesController.syncModels,
);
router.get(
        '/:index',
        TablesController.getIndexByName,
);
router.post(
        '/index',
        TablesController.setFieldIndexStatus,
);
router.delete(
        '/:index',
        TablesController.deleteIndex,
);

router.get(
        '/search/:index',
        TablesController.search,
);

export default router;
