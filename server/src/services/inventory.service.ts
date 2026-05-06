import prisma from '../config/database.js';
import { StockError } from '../utils/errors.js';
import logger from '../utils/logger.js';

interface StockItem {
  sku: string;
  quantity: number;
}

export class InventoryService {
  private reservations = new Map<string, StockItem[]>();

  async reserveStock(items: StockItem[], orderId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const stock = await tx.stock.findUnique({ where: { sku: item.sku } });

        if (!stock || stock.quantity < item.quantity) {
          logger.warn('Insufficient stock', { sku: item.sku, requested: item.quantity, available: stock?.quantity ?? 0 });
          throw new StockError(`Insufficient stock for SKU: ${item.sku}`);
        }

        await tx.stock.update({
          where: { sku: item.sku },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    });

    this.reservations.set(orderId, items);
    logger.info('Stock reserved', { orderId, items });
  }

  async releaseStock(orderId: string): Promise<void> {
    const items = this.reservations.get(orderId);
    if (!items) return;

    await Promise.all(
      items.map((item) =>
        prisma.stock.update({
          where: { sku: item.sku },
          data: { quantity: { increment: item.quantity } },
        }),
      ),
    );

    this.reservations.delete(orderId);
    logger.info('Stock released', { orderId });
  }

  async confirmStockDeduction(orderId: string): Promise<void> {
    this.reservations.delete(orderId);
    logger.info('Stock confirmed', { orderId });
  }

  async getLowStock(threshold = 3) {
    return prisma.stock.findMany({
      where: { quantity: { lte: threshold } },
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { quantity: 'asc' },
    });
  }

  async updateVariantStock(productId: string, size: string, colorName: string, quantity: number) {
    return prisma.stock.updateMany({
      where: { productId, size, colorName },
      data: { quantity },
    });
  }
}
