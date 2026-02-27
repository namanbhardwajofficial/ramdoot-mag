import { Router } from 'express';
import * as ctrl from '../controllers/publicationController.js';

const router = Router();

router.get('/stats',             ctrl.getStats);
router.get('/weekly-chart',      ctrl.getWeeklyChart);
router.get('/',                  ctrl.list);
router.get('/:id',              ctrl.getById);
router.get('/:id/performance',  ctrl.getPerformance);
router.get('/:id/financials',   ctrl.getFinancials);
router.get('/:id/versions',    ctrl.getVersions);
router.post('/',                ctrl.create);
router.patch('/:id',           ctrl.update);
router.patch('/:id/status',    ctrl.updateStatus);
router.delete('/:id',          ctrl.remove);

export default router;
