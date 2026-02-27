import { Router } from 'express';
import * as ctrl from '../controllers/campaignController.js';

const router = Router();

router.get('/',                  ctrl.list);
router.get('/:id',              ctrl.getById);
router.get('/:id/financials',  ctrl.getFinancials);
router.post('/',               ctrl.create);
router.patch('/:id/status',    ctrl.updateStatus);
router.delete('/:id',          ctrl.remove);

export default router;
