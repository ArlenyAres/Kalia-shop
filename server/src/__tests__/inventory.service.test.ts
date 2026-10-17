const mockTransaction = jest.fn();
const mockStockUpdateMany = jest.fn();
const mockStockFindMany = jest.fn();
const mockOrderItemFindMany = jest.fn();

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    $transaction: mockTransaction,
    stock: {
      updateMany: mockStockUpdateMany,
      findMany: mockStockFindMany,
    },
    orderItem: { findMany: mockOrderItemFindMany },
  },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import type { Prisma } from '@prisma/client';
import { InventoryService } from '../services/inventory.service';
import { StockError } from '../utils/errors';

function fakeTx(updatedCount: number, sku = 'KAL-AUR-SS-S') {
  return {
    stock: {
      updateMany: jest.fn().mockResolvedValue({ count: updatedCount }),
      findFirst: jest.fn().mockResolvedValue({ sku }),
    },
  } as unknown as Prisma.TransactionClient & {
    stock: { updateMany: jest.Mock; findFirst: jest.Mock };
  };
}

const variant = { productId: 'p1', size: 'S', colorName: 'Sage Shore', quantity: 3 };

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
    jest.clearAllMocks();
  });

  describe('reserveStock', () => {
    it('decrements only when enough stock is available and returns the SKU', async () => {
      const tx = fakeTx(1);

      await expect(service.reserveStock(tx, [variant])).resolves.toEqual(['KAL-AUR-SS-S']);

      expect(tx.stock.updateMany).toHaveBeenCalledWith({
        where: { productId: 'p1', size: 'S', colorName: 'Sage Shore', quantity: { gte: 3 } },
        data: { quantity: { decrement: 3 } },
      });
    });

    it('throws StockError when no variant has enough quantity', async () => {
      const tx = fakeTx(0);

      await expect(service.reserveStock(tx, [variant])).rejects.toThrow(StockError);
    });
  });

  describe('releaseStock', () => {
    it('restores the quantities stored in the order items', async () => {
      mockOrderItemFindMany.mockResolvedValue([
        { productId: 'p1', size: 'S', color: 'Sage Shore', quantity: 2 },
      ]);
      mockStockUpdateMany.mockReturnValue('op');
      mockTransaction.mockResolvedValue([]);

      await service.releaseStock('order-4');

      expect(mockStockUpdateMany).toHaveBeenCalledWith({
        where: { productId: 'p1', size: 'S', colorName: 'Sage Shore' },
        data: { quantity: { increment: 2 } },
      });
      expect(mockTransaction).toHaveBeenCalledWith(['op']);
    });

    it('does nothing for an order without items', async () => {
      mockOrderItemFindMany.mockResolvedValue([]);

      await service.releaseStock('nonexistent-order');

      expect(mockTransaction).not.toHaveBeenCalled();
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
