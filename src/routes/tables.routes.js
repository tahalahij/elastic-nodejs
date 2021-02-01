import { Router } from 'express';
import { TablesController, ThesisController } from '../controllers';

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
