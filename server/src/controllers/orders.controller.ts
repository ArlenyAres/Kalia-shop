import type { OrderStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { OrderService } from '../services/order.service.js';
import type { CheckoutRequest } from '../validation/schemas.js';

const orderService = new OrderService();
const dashboardService = new DashboardService();

// Todos los handlers reciben body/query ya validados por el middleware `validate`.

export const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.createOrder(req.body as CheckoutRequest);
    res.status(201).json({ orderNumber: order.orderNumber, total: order.total });
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await orderService.listOrders(req.query as unknown as { page: number; limit: number; status?: OrderStatus }));
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await orderService.getOrderById(req.params.id as string));
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: OrderStatus };
    res.json(await orderService.updateOrderStatus(req.params.id as string, status));
  } catch (err) {
    next(err);
  }
};

export const updateOrderTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingNumber } = req.body as { trackingNumber: string };
    res.json(await orderService.updateTracking(req.params.id as string, trackingNumber));
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await dashboardService.getSummary());
  } catch (err) {
    next(err);
  }
};
