import { CartService } from '../services/CartService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Cart Controller
 */
export const CartController = {
  /**
   * Get cart items
   */
  getCart: asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    const cart = await CartService.getCart(userId, sessionId);
    return successResponse(res, cart, 'Cart retrieved successfully');
  }),

  /**
   * Add item to cart
   */
  addToCart: asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const { beatId, licenseTierId } = req.body;

    const cart = await CartService.addToCart(userId, sessionId, beatId, licenseTierId);
    return successResponse(res, cart, 'Item added to cart');
  }),

  /**
   * Remove item from cart
   */
  removeFromCart: asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const { beatId } = req.params;

    const cart = await CartService.removeFromCart(userId, sessionId, beatId);
    return successResponse(res, cart, 'Item removed from cart');
  }),

  /**
   * Clear cart
   */
  clearCart: asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    const cart = await CartService.clearCart(userId, sessionId);
    return successResponse(res, cart, 'Cart cleared');
  }),

  /**
   * Merge guest cart into user cart (call after login)
   */
  mergeCart: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    const cart = await CartService.mergeCart(userId, sessionId);
    return successResponse(res, cart, 'Cart merged successfully');
  }),

  /**
   * Update license tier for cart item
   */
  updateTier: asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const { beatId } = req.params;
    const { licenseTierId } = req.body;

    const cart = await CartService.updateCartItemTier(userId, sessionId, beatId, licenseTierId);
    return successResponse(res, cart, 'Cart item updated');
  }),
};

export default CartController;
