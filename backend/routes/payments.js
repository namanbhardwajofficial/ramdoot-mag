import { Router } from 'express';
import * as ctrl from '../controllers/paymentController.js';

const router = Router();

router.get('/stats',                  ctrl.getStats);
router.get('/chart',                  ctrl.getChart);
router.get('/influencer-payouts',     ctrl.listPayouts);
router.get('/influencer-payouts/:id', ctrl.getPayoutById);
router.get('/',                       ctrl.list);
router.get('/:id',                   ctrl.getById);
router.post('/:id/retry',           ctrl.retry);
router.post('/:id/refund',          ctrl.refund);

export default router;
