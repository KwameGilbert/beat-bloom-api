import express from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public webhook route (verified via signature)
router.post('/webhook/paystack', PaymentController.webhook);

// Protected verification route
router.get('/verify/paystack/:reference', authenticate, PaymentController.verify);

export default router;
