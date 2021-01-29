import { Router } from 'express';

import { ThesisController } from '../controllers';


const router = Router();

router.get(
        '/setIndex',
        ThesisController.setIndex,
);

router.get(
        '/deleteIndex',
        ThesisController.deleteIndex,
);

router.get(
        '/import',
        ThesisController.importAll,
);

router.post(
        '/insert',
        ThesisController.insert,
);

router.get(
        '/getAll',
        ThesisController.getAll,
);

router.get(
        '/search',
        ThesisController.search,
);


export default router;
