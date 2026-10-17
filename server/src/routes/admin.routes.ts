import { Router } from 'express';
import {
  adminGetProduct,
  adminGetProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  updateStock,
  upload,
  uploadImages,
} from '../controllers/products.controller.js';
import {
  getDashboard,
  getOrder,
  listOrders,
  updateOrderStatus,
  updateOrderTracking,
} from '../controllers/orders.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  orderListQuerySchema,
  orderStatusSchema,
  paginationSchema,
  productCreateSchema,
  productUpdateSchema,
  stockUpdateSchema,
  trackingSchema,
} from '../validation/schemas.js';

const router = Router();

router.use(verifyToken, requireAdmin);

// Products
router.get('/products', validate(paginationSchema, 'query'), adminGetProducts);
router.get('/products/:id', adminGetProduct);
router.post('/products', validate(productCreateSchema), createProduct);
router.put('/products/:id', validate(productUpdateSchema), updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', validate(stockUpdateSchema), updateStock);
router.post('/products/:id/images', upload.array('images', 10), uploadImages);

// Orders
router.get('/orders', validate(orderListQuerySchema, 'query'), listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', validate(orderStatusSchema), updateOrderStatus);
router.patch('/orders/:id/tracking', validate(trackingSchema), updateOrderTracking);

// Dashboard
router.get('/dashboard', getDashboard);

export default router;
