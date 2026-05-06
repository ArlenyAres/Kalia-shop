import { Router } from 'express';
import {
  getByCategory,
  getBySlug,
  getFeatured,
  getProducts,
  searchProducts,
} from '../controllers/products.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/search', searchProducts);
router.get('/category/:category', getByCategory);
router.get('/:slug', getBySlug);

export default router;
