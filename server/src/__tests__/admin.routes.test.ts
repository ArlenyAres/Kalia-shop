process.env.JWT_SECRET = 'kalia-test-secret-admin';

const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdateVariantStock = jest.fn();
const mockProductCount = jest.fn();
const mockOrderCount = jest.fn();
const mockOrderFindMany = jest.fn();
const mockStockFindMany = jest.fn();

jest.mock('../services/product.service', () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    getAll: mockGetAll,
    create: mockCreate,
  })),
}));

jest.mock('../services/inventory.service', () => ({
  InventoryService: jest.fn().mockImplementation(() => ({
    updateVariantStock: mockUpdateVariantStock,
  })),
}));

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    order: { findMany: mockOrderFindMany, count: mockOrderCount, findUnique: jest.fn(), update: jest.fn() },
    product: { count: mockProductCount },
    stock: { findMany: mockStockFindMany },
  },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
  httpLogger: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import jwt from 'jsonwebtoken';
import request from 'supertest';
import express from 'express';
import adminRouter from '../routes/admin.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);
app.use(errorHandler);

const JWT_SECRET = 'kalia-test-secret-admin';
const adminToken = jwt.sign(
  { id: 'admin-1', email: 'admin@kalia.shop', name: 'Admin', isAdmin: true },
  JWT_SECRET,
);
const userToken = jwt.sign(
  { id: 'user-1', email: 'user@kalia.shop', name: 'User', isAdmin: false },
  JWT_SECRET,
);

const fakePaginated = {
  products: [{ id: 'p1', name: 'Aurelia Set', slug: 'aurelia-set' }],
  pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
};

describe('GET /api/admin/products', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 without JWT', async () => {
    const res = await request(app).get('/api/admin/products');
    expect(res.status).toBe(401);
  });

  it('returns 403 with non-admin JWT', async () => {
    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('returns 200 with valid admin JWT', async () => {
    mockGetAll.mockResolvedValue(fakePaginated);
    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });
});

describe('POST /api/admin/products', () => {
  it('creates product and returns 201', async () => {
    const newProduct = { id: 'p2', name: 'Nerina Triangle', slug: 'nerina-triangle' };
    mockCreate.mockResolvedValue(newProduct);
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nerina Triangle', category: 'bikini', price: 12800 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('p2');
  });
});

describe('PATCH /api/admin/products/:id/stock', () => {
  it('updates variant quantity', async () => {
    mockUpdateVariantStock.mockResolvedValue({ count: 1 });
    const res = await request(app)
      .patch('/api/admin/products/p1/stock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ size: 'S', colorName: 'Sage Shore', quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(mockUpdateVariantStock).toHaveBeenCalledWith('p1', 'S', 'Sage Shore', 5);
  });
});

describe('GET /api/admin/dashboard', () => {
  it('returns { totalProducts, totalOrders, lowStock }', async () => {
    mockProductCount.mockResolvedValue(12);
    mockOrderCount.mockResolvedValue(34);
    mockOrderFindMany.mockResolvedValue([]);
    mockStockFindMany.mockResolvedValue([{ id: 's1', quantity: 2, product: { name: 'Aurelia Set' } }]);
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalProducts: 12,
      totalOrders: 34,
    });
    expect(Array.isArray(res.body.lowStock)).toBe(true);
  });
});
