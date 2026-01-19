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
};

export default OrderController;
