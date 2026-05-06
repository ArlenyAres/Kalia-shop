const mockTransaction = jest.fn();
const mockStockFindUnique = jest.fn();
const mockStockUpdate = jest.fn();
const mockStockUpdateMany = jest.fn();
const mockStockFindMany = jest.fn();

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    $transaction: mockTransaction,
    stock: {
      findUnique: mockStockFindUnique,
      update: mockStockUpdate,
      updateMany: mockStockUpdateMany,
      findMany: mockStockFindMany,
    },
  },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import { InventoryService } from '../services/inventory.service';
import { StockError } from '../utils/errors';

const mockStock = { id: 's1', sku: 'KAL-AUR-SS-S', quantity: 8, productId: 'p1', size: 'S', colorName: 'Sage Shore', updatedAt: new Date() };

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
    jest.clearAllMocks();
  });

  describe('reserveStock', () => {
    it('decrements quantity correctly when stock is sufficient', async () => {
      mockTransaction.mockImplementation(async (fn: (tx: typeof import('../config/database')['default']) => Promise<void>) => {
        const tx = { stock: { findUnique: jest.fn().mockResolvedValue(mockStock), update: jest.fn() } };
        await fn(tx as unknown as typeof import('../config/database')['default']);
      });

      await expect(
        service.reserveStock([{ sku: 'KAL-AUR-SS-S', quantity: 3 }], 'order-1'),
      ).resolves.toBeUndefined();
    });

    it('throws StockError when quantity is insufficient', async () => {
      mockTransaction.mockImplementation(async (fn: (tx: typeof import('../config/database')['default']) => Promise<void>) => {
        const tx = {
          stock: {
            findUnique: jest.fn().mockResolvedValue({ ...mockStock, quantity: 1 }),
            update: jest.fn(),
          },
        };
        await fn(tx as unknown as typeof import('../config/database')['default']);
      });

      await expect(
        service.reserveStock([{ sku: 'KAL-AUR-SS-S', quantity: 5 }], 'order-2'),
      ).rejects.toThrow(StockError);
    });

    it('throws StockError when SKU does not exist', async () => {
      mockTransaction.mockImplementation(async (fn: (tx: typeof import('../config/database')['default']) => Promise<void>) => {
        const tx = { stock: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() } };
        await fn(tx as unknown as typeof import('../config/database')['default']);
      });

      await expect(
        service.reserveStock([{ sku: 'UNKNOWN', quantity: 1 }], 'order-3'),
      ).rejects.toThrow(StockError);
    });
  });

  describe('releaseStock', () => {
    it('restores reserved quantity', async () => {
      mockTransaction.mockImplementation(async (fn: (tx: typeof import('../config/database')['default']) => Promise<void>) => {
        const tx = { stock: { findUnique: jest.fn().mockResolvedValue(mockStock), update: jest.fn() } };
        await fn(tx as unknown as typeof import('../config/database')['default']);
      });
      mockStockUpdate.mockResolvedValue({});

      await service.reserveStock([{ sku: 'KAL-AUR-SS-S', quantity: 2 }], 'order-4');
      await service.releaseStock('order-4');

      expect(mockStockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { quantity: { increment: 2 } } }),
      );
    });

    it('does nothing for unknown orderId', async () => {
      await service.releaseStock('nonexistent-order');
      expect(mockStockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('confirmStockDeduction', () => {
    it('finalizes deduction by clearing reservation', async () => {
      mockTransaction.mockImplementation(async (fn: (tx: typeof import('../config/database')['default']) => Promise<void>) => {
        const tx = { stock: { findUnique: jest.fn().mockResolvedValue(mockStock), update: jest.fn() } };
        await fn(tx as unknown as typeof import('../config/database')['default']);
      });

      await service.reserveStock([{ sku: 'KAL-AUR-SS-S', quantity: 1 }], 'order-5');
      await service.confirmStockDeduction('order-5');

      // After confirm, release should be a no-op
      mockStockUpdate.mockClear();
      await service.releaseStock('order-5');
      expect(mockStockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getLowStock', () => {
    it('returns products with quantity <= threshold', async () => {
      const lowItems = [{ id: 's1', quantity: 2, product: { name: 'Test' } }];
      mockStockFindMany.mockResolvedValue(lowItems);

      const result = await service.getLowStock(3);

      expect(result).toEqual(lowItems);
      expect(mockStockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { quantity: { lte: 3 } } }),
      );
    });
  });
});
