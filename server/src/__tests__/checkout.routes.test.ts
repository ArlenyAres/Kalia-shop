const mockCreateOrder = jest.fn();

jest.mock('../services/order.service', () => ({
  OrderService: jest.fn().mockImplementation(() => ({ createOrder: mockCreateOrder })),
}));

jest.mock('../services/dashboard.service', () => ({
  DashboardService: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import express from 'express';
import request from 'supertest';
import checkoutRouter from '../routes/checkout.routes';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { StockError } from '../utils/errors';

const app = express();
app.use(express.json());
app.use('/api/checkout', checkoutRouter);
app.use(errorHandler);

const validBody = {
  items: [{ productId: 'p1', size: 'M', color: 'Ebony', quantity: 1, price: 1 }],
  shippingAddress: {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@test.com',
    street: 'Calle 1',
    city: 'Madrid',
    state: 'MD',
    zip: '28001',
    country: 'ES',
  },
  paymentMethod: 'card',
  total: 1,
};

describe('POST /api/checkout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates the order and returns its number', async () => {
    mockCreateOrder.mockResolvedValue({ orderNumber: 'KAL-2026-ABC234', total: 18500 });

    const res = await request(app).post('/api/checkout').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ orderNumber: 'KAL-2026-ABC234', total: 18500 });
  });

  it('drops client-sent prices and totals before reaching the service', async () => {
    mockCreateOrder.mockResolvedValue({ orderNumber: 'KAL-2026-ABC234', total: 18500 });

    await request(app).post('/api/checkout').send(validBody);

    const received = mockCreateOrder.mock.calls[0][0];
    expect(received.total).toBeUndefined();
    expect(received.items[0].price).toBeUndefined();
  });

  it('returns 422 for an invalid body', async () => {
    const res = await request(app).post('/api/checkout').send({ items: [], paymentMethod: 'cash' });

    expect(res.status).toBe(422);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('returns 409 when there is not enough stock', async () => {
    mockCreateOrder.mockRejectedValue(new StockError('Sin stock'));

    const res = await request(app).post('/api/checkout').send(validBody);

    expect(res.status).toBe(409);
  });
});
