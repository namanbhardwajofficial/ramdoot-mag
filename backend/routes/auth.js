import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';

const router = Router();

router.post('/signup',   ctrl.signup);
router.post('/login',    ctrl.login);
router.post('/send-otp', ctrl.sendOTP);

export default router;
