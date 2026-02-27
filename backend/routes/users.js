import { Router } from 'express';
import * as ctrl from '../controllers/userController.js';

const router = Router();

router.get('/stats',         ctrl.getStats);
router.get('/',              ctrl.list);
router.get('/:id',          ctrl.getById);
router.post('/',            ctrl.create);
router.patch('/:id',       ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id',      ctrl.remove);

export default router;
