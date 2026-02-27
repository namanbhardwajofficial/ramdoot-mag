import { Router } from 'express';
import * as ctrl from '../controllers/influencerController.js';

const router = Router();

router.get('/',                  ctrl.list);
router.get('/:id',              ctrl.getById);
router.get('/:id/campaigns',   ctrl.getCampaigns);
router.get('/:id/audience',    ctrl.getAudience);
router.get('/:id/payments',    ctrl.getPayments);
router.patch('/:id/status',    ctrl.updateStatus);

export default router;
