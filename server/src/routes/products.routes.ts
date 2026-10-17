import { Router } from 'express';
import {
  getByCategory,
  getBySlug,
  getFeatured,
  getProducts,
  searchProducts,
} from '../controllers/products.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { categoryParamSchema, productListQuerySchema, searchQuerySchema } from '../validation/schemas.js';

const router = Router();

router.get('/', validate(productListQuerySchema, 'query'), getProducts);
router.get('/featured', getFeatured);
router.get('/search', validate(searchQuerySchema, 'query'), searchProducts);
router.get('/category/:category', validate(categoryParamSchema, 'params'), getByCategory);
router.get('/:slug', getBySlug);

export default router;
