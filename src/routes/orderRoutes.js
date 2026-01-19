import express from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

/**
 * Orders
 */
router.post('/', OrderController.create);
router.get('/', OrderController.listMyOrders);
router.get('/purchases', OrderController.listMyPurchases);
router.get('/purchases/beat/:beatId', OrderController.getPurchasedTiersForBeat);
router.get('/:id', OrderController.get);

export default router;
