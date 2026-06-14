import express from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public webhook routes
router.post('/webhook', PaymentController.webhook);
router.post('/webhook/paystack', PaymentController.webhook);
router.post('/webhook/hubtel', PaymentController.webhook);

// Protected verification routes
router.get('/verify/:reference', authenticate, PaymentController.verify);
router.get('/verify/paystack/:reference', authenticate, PaymentController.verify);
router.get('/verify/hubtel/:reference', authenticate, PaymentController.verify);

export default router;
