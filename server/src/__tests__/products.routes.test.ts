const mockGetAll = jest.fn();
const mockGetFeatured = jest.fn();
const mockGetBySlug = jest.fn();
const mockGetByCategory = jest.fn();
const mockSearch = jest.fn();

jest.mock('../services/product.service', () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    getAll: mockGetAll,
    getFeatured: mockGetFeatured,
    getBySlug: mockGetBySlug,
    getByCategory: mockGetByCategory,
    search: mockSearch,
  })),
}));

jest.mock('../services/inventory.service', () => ({
  InventoryService: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import request from 'supertest';
import express from 'express';
import productRouter from '../routes/products.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { NotFoundError } from '../utils/errors';

const app = express();
app.use(express.json());
app.use('/api/products', productRouter);
app.use(errorHandler);

const fakeProducts = [
  { id: '1', name: 'Aurelia Set', slug: 'aurelia-set', category: 'bikini', isFeatured: true },
  { id: '2', name: 'Nerina Triangle', slug: 'nerina-triangle', category: 'bikini', isFeatured: false },
];

const paginatedResponse = {
  products: fakeProducts,
  pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
};

describe('GET /api/products', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with array and pagination meta', async () => {
    mockGetAll.mockResolvedValue(paginatedResponse);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it('returns only bikinis for /category/bikini', async () => {
    const bikinis = fakeProducts.filter((p) => p.category === 'bikini');
    mockGetByCategory.mockResolvedValue(bikinis);

    const res = await request(app).get('/api/products/category/bikini');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockGetByCategory).toHaveBeenCalledWith('bikini');
  });

  it('returns 404 for unknown slug', async () => {
    mockGetBySlug.mockRejectedValue(new NotFoundError('Product not found: ghost-product'));

    const res = await request(app).get('/api/products/ghost-product');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFoundError');
  });

  it('returns only featured products from /featured', async () => {
    const featured = fakeProducts.filter((p) => p.isFeatured);
    mockGetFeatured.mockResolvedValue(featured);

    const res = await request(app).get('/api/products/featured');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((p: { isFeatured: boolean }) => p.isFeatured)).toBe(true);
  });
});
