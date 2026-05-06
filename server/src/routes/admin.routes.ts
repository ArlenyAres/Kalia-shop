import { Router } from 'express';
import {
  adminGetProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  updateStock,
  uploadImages,
} from '../controllers/products.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import prisma from '../config/database.js';
import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger.js';

const router = Router();

router.use(verifyToken, requireAdmin);

// Products
router.get('/products', adminGetProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateStock);
router.post('/products/:id/images', uploadImages);

// Orders
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count(),
    ]);
    res.json({ orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: { items: true },
    });
    if (!order) { res.status(404).json({ error: 'NotFoundError', message: 'Order not found' }); return; }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: string };
    const order = await prisma.order.update({ where: { id: req.params.id as string }, data: { status: status as Parameters<typeof prisma.order.update>[0]['data']['status'] } });
    logger.info('Order status updated', { orderId: req.params.id, status });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/tracking', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingNumber } = req.body as { trackingNumber: string };
    const order = await prisma.order.update({ where: { id: req.params.id as string }, data: { trackingNumber } });
    logger.info('Order tracking updated', { orderId: req.params.id, trackingNumber });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Dashboard
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalProducts, totalOrders, recentOrders, lowStock] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, orderNumber: true, status: true, total: true, createdAt: true } }),
      prisma.stock.findMany({ where: { quantity: { lte: 3 } }, include: { product: { select: { name: true } } } }),
    ]);
    res.json({ totalProducts, totalOrders, recentOrders, lowStock });
  } catch (err) {
    next(err);
  }
});

export default router;
