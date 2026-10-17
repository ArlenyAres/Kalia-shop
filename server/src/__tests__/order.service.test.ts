jest.mock('../config/database', () => ({ __esModule: true, default: {} }));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import type { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { OrderService, generateOrderNumber } from '../services/order.service';
import type { EmailService } from '../services/email.service';
import type { InventoryService } from '../services/inventory.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import type { CheckoutRequest } from '../validation/schemas';

const mockLogger = logger as jest.Mocked<typeof logger>;

const input: CheckoutRequest = {
  items: [{ productId: 'p1', size: 'S', color: 'Sage Shore', quantity: 2 }],
  shippingAddress: {
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana@test.com',
    street: 'Calle Delpín 12',
    city: 'Santo Domingo',
    state: 'DN',
    zip: '10100',
    country: 'DO',
  },
  paymentMethod: 'paypal',
};

function setup() {
  const tx = {
    product: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'p1', name: 'Aurelia Set', price: 14500, images: ['https://example.com/a.jpg'] },
      ]),
    },
    order: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'ord-1', ...data, items: data.items.create }),
      ),
    },
  };
  const db = {
    $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
    order: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  };
  const inventory = {
    reserveStock: jest.fn().mockResolvedValue(['KAL-AUR-SS-S']),
    releaseStock: jest.fn().mockResolvedValue(undefined),
  };
  const email = { sendOrderConfirmation: jest.fn().mockResolvedValue(undefined) };
  const service = new OrderService(
    db as unknown as PrismaClient,
    inventory as unknown as InventoryService,
    email as unknown as EmailService,
  );
  return { service, tx, db, inventory, email };
}

describe('generateOrderNumber', () => {
  it('uses the KAL-YYYY-XXXXXX format', () => {
    expect(generateOrderNumber(new Date('2026-05-01'))).toMatch(/^KAL-2026-[A-Z2-9]{6}$/);
  });
});

describe('OrderService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createOrder', () => {
    it('prices items from the database, never from the client', async () => {
      const { service, tx } = setup();

      const order = await service.createOrder(input);

      const data = tx.order.create.mock.calls[0][0].data;
      expect(data.subtotal).toBe(29000);
      expect(data.total).toBe(29000);
      expect(data.items.create[0]).toMatchObject({ price: 14500, productName: 'Aurelia Set', sku: 'KAL-AUR-SS-S' });
      expect(order.orderNumber).toMatch(/^KAL-\d{4}-/);
    });

    it('reserves stock by product variant inside the transaction', async () => {
      const { service, tx, inventory } = setup();

      await service.createOrder(input);

      expect(inventory.reserveStock).toHaveBeenCalledWith(tx, [
        { productId: 'p1', size: 'S', colorName: 'Sage Shore', quantity: 2 },
      ]);
    });

    it('rejects products that are missing or inactive', async () => {
      const { service, tx } = setup();
      tx.product.findMany.mockResolvedValue([]);

      await expect(service.createOrder(input)).rejects.toThrow(ValidationError);
      expect(tx.order.create).not.toHaveBeenCalled();
    });

    it('sends the confirmation email without blocking the order', async () => {
      const { service, email } = setup();
      email.sendOrderConfirmation.mockRejectedValue(new Error('SMTP down'));

      await expect(service.createOrder(input)).resolves.toBeDefined();
      expect(email.sendOrderConfirmation).toHaveBeenCalled();
    });
  });

  describe('getOrderByNumber', () => {
    it('returns null for unknown number', async () => {
      const { service, db } = setup();
      db.order.findUnique.mockResolvedValue(null);

      const result = await service.getOrderByNumber('KAL-2099-999');

      expect(result).toBeNull();
      expect(db.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { orderNumber: 'KAL-2099-999' } }),
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('logs the status transition', async () => {
      const { service, db } = setup();
      db.order.findUnique.mockResolvedValue({ status: 'paid' });
      db.order.update.mockResolvedValue({ id: 'ord-4', status: 'shipped' });

      await service.updateOrderStatus('ord-4', 'shipped');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Order status updated',
        expect.objectContaining({ orderId: 'ord-4', from: 'paid', status: 'shipped' }),
      );
    });

    it('returns stock to inventory when an order is cancelled', async () => {
      const { service, db, inventory } = setup();
      db.order.findUnique.mockResolvedValue({ status: 'pending' });
      db.order.update.mockResolvedValue({ id: 'ord-5', status: 'cancelled' });

      await service.updateOrderStatus('ord-5', 'cancelled');

      expect(inventory.releaseStock).toHaveBeenCalledWith('ord-5');
    });

    it('does not release stock twice', async () => {
      const { service, db, inventory } = setup();
      db.order.findUnique.mockResolvedValue({ status: 'cancelled' });
      db.order.update.mockResolvedValue({ id: 'ord-6', status: 'refunded' });

      await service.updateOrderStatus('ord-6', 'refunded');

      expect(inventory.releaseStock).not.toHaveBeenCalled();
    });

    it('throws NotFoundError for unknown orders', async () => {
      const { service, db } = setup();
      db.order.findUnique.mockResolvedValue(null);

      await expect(service.updateOrderStatus('nope', 'paid')).rejects.toThrow(NotFoundError);
    });
  });
});
