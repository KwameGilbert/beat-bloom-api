import express from 'express';
import { CartController } from '../controllers/CartController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Cart Routes - supports both authenticated users and guests (via session ID)
 */

// Get cart (optional auth - works for guests too)
router.get('/', optionalAuth, CartController.getCart);

// Add item to cart
router.post('/items', optionalAuth, CartController.addToCart);

// Remove item from cart
router.delete('/items/:beatId', optionalAuth, CartController.removeFromCart);

// Update license tier for cart item
router.patch('/items/:beatId', optionalAuth, CartController.updateTier);

// Clear cart
router.delete('/', optionalAuth, CartController.clearCart);

// Merge guest cart into user cart (requires auth)
router.post('/merge', authenticate, CartController.mergeCart);

export default router;
