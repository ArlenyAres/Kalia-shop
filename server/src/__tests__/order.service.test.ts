const mockOrderCreate = jest.fn();
const mockOrderCount = jest.fn();
const mockOrderFindUnique = jest.fn();
const mockOrderUpdate = jest.fn();
const mockReserveStock = jest.fn();
const mockSendOrderConfirmation = jest.fn();

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    order: {
      create: mockOrderCreate,
      count: mockOrderCount,
      findUnique: mockOrderFindUnique,
      update: mockOrderUpdate,
    },
  },
}));

jest.mock('../services/inventory.service', () => ({
  InventoryService: jest.fn().mockImplementation(() => ({
    reserveStock: mockReserveStock,
  })),
}));

jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendOrderConfirmation: mockSendOrderConfirmation,
  })),
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import logger from '../utils/logger';
import { OrderService, type CreateOrderInput } from '../services/order.service';

const mockLogger = logger as jest.Mocked<typeof logger>;

const fakeInput: CreateOrderInput = {
  items: [
    {
      productId: 'p1',
      productName: 'Aurelia Set',
      imageUrl: 'https://example.com/img.jpg',
      slug: 'aurelia-set',
      color: 'Sage Shore',
      size: 'S',
      sku: 'KAL-AUR-SS-S',
      price: 14500,
      quantity: 1,
    },
  ],
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
  paymentId: 'PAY-ABC123',
  subtotal: 14500,
  shippingCost: 0,
  total: 14500,
  guestEmail: 'ana@test.com',
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService();
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('generates orderNumber in KAL-YYYY-NNN format', async () => {
      const year = new Date().getFullYear();
      mockOrderCount.mockResolvedValue(5);
      mockOrderCreate.mockResolvedValue({
        id: 'ord-1',
        orderNumber: `KAL-${year}-006`,
        items: [],
        guestEmail: 'ana@test.com',
        total: 14500,
      });
      mockReserveStock.mockResolvedValue(undefined);
      mockSendOrderConfirmation.mockResolvedValue(undefined);

      const order = await service.createOrder(fakeInput);

      const callArg = mockOrderCreate.mock.calls[0][0] as { data: { orderNumber: string } };
      expect(callArg.data.orderNumber).toMatch(/^KAL-\d{4}-\d{3}$/);
      expect(callArg.data.orderNumber).toBe(`KAL-${year}-006`);
      expect(order.orderNumber).toMatch(/^KAL-/);
    });

    it('calls reserveStock with cart items', async () => {
      mockOrderCount.mockResolvedValue(0);
      mockOrderCreate.mockResolvedValue({
        id: 'ord-2',
        orderNumber: 'KAL-2026-001',
        items: [],
        guestEmail: 'ana@test.com',
        total: 14500,
      });
      mockReserveStock.mockResolvedValue(undefined);
      mockSendOrderConfirmation.mockResolvedValue(undefined);

      await service.createOrder(fakeInput);

      expect(mockReserveStock).toHaveBeenCalledWith(
        [{ sku: 'KAL-AUR-SS-S', quantity: 1 }],
        'ord-2',
      );
    });

    it('calls sendOrderConfirmation on success', async () => {
      const fakeOrder = {
        id: 'ord-3',
        orderNumber: 'KAL-2026-001',
        items: [],
        guestEmail: 'ana@test.com',
        total: 14500,
      };
      mockOrderCount.mockResolvedValue(0);
      mockOrderCreate.mockResolvedValue(fakeOrder);
      mockReserveStock.mockResolvedValue(undefined);
      mockSendOrderConfirmation.mockResolvedValue(undefined);

      await service.createOrder(fakeInput);

      expect(mockSendOrderConfirmation).toHaveBeenCalledWith(fakeOrder);
    });
  });

  describe('getOrderByNumber', () => {
    it('returns null for unknown number', async () => {
      mockOrderFindUnique.mockResolvedValue(null);

      const result = await service.getOrderByNumber('KAL-2099-999');

      expect(result).toBeNull();
      expect(mockOrderFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { orderNumber: 'KAL-2099-999' } }),
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('logs status transition', async () => {
      mockOrderUpdate.mockResolvedValue({ id: 'ord-4', status: 'shipped' });

      await service.updateOrderStatus('ord-4', 'shipped');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Order status updated',
        expect.objectContaining({ orderId: 'ord-4', status: 'shipped' }),
      );
    });
  });
});
