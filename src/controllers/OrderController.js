import { OrderService } from '../services/OrderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Order Controller
 */
export const OrderController = {
  /**
   * Create a new order
   */
  create: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const order = await OrderService.createOrder(userId, req.body);
    return successResponse(res, order, 'Order created successfully', {}, 201);
  }),

  /**
   * Get my orders
   */
  listMyOrders: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orders = await OrderService.getUserOrders(userId);
    return successResponse(res, orders, 'Orders retrieved successfully');
  }),

  /**
   * Get order details
   */
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const order = await OrderService.getOrderDetail(id, userId);
    return successResponse(res, order, 'Order retrieved successfully');
  }),

  /**
   * Get my purchased beats
   */
  listMyPurchases: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const purchases = await OrderService.getUserPurchases(userId);
    return successResponse(res, purchases, 'Purchases retrieved successfully');
  }),

  /**
   * Get purchased license tiers for a specific beat
   */
  getPurchasedTiersForBeat: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { beatId } = req.params;
    const tiers = await OrderService.getUserPurchasedTiersForBeat(userId, beatId);
    return successResponse(res, tiers, 'Purchased tiers retrieved successfully');
  }),

  /**
   * Get download links for a purchase
   */
  getDownloadLinks: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const files = await OrderService.getPurchaseFiles(userId, id);
    return successResponse(res, files, 'Download links retrieved successfully');
  }),
};

export default OrderController;
