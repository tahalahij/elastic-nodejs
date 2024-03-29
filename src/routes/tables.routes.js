import { Router } from 'express';
import { TablesController } from 'controllers';

const router = Router();

router.get(
        '/',
        TablesController.getAll,
);
router.get(
        '/elastic/indexes',
        TablesController.getAllElasticIndexes,
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
        '/import/:index',
        TablesController.importAll,
);

router.get(
        '/search/:index',
        TablesController.search,
);

export default router;
