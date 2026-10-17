import type { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';
import { StockError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export interface VariantQuantity {
  productId: string;
  size: string;
  colorName: string;
  quantity: number;
}

type Tx = Prisma.TransactionClient;

export class InventoryService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Descuenta stock dentro de la transacción recibida. El descuento es condicional
   * (quantity >= pedido) para que dos compras simultáneas no dejen stock negativo.
   * Devuelve el SKU real de cada variante.
   */
  async reserveStock(tx: Tx, items: VariantQuantity[]): Promise<string[]> {
    const skus: string[] = [];
    for (const item of items) {
      const where = { productId: item.productId, size: item.size, colorName: item.colorName };
      const { count } = await tx.stock.updateMany({
        where: { ...where, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });

      if (count === 0) {
        logger.warn('Insufficient stock', { ...where, requested: item.quantity });
        throw new StockError(`Sin stock suficiente para ${item.size} / ${item.colorName}`);
      }

      const variant = await tx.stock.findFirst({ where, select: { sku: true } });
      skus.push(variant?.sku ?? '');
    }
    return skus;
  }

  /** Devuelve al inventario las unidades de un pedido (cancelación o pago fallido). */
  async releaseStock(orderId: string): Promise<void> {
    const items = await this.db.orderItem.findMany({ where: { orderId } });
    if (!items.length) return;

    await this.db.$transaction(
      items.map((item) =>
        this.db.stock.updateMany({
          where: { productId: item.productId, size: item.size, colorName: item.color },
          data: { quantity: { increment: item.quantity } },
        }),
      ),
    );
    logger.info('Stock released', { orderId });
  }

  async getLowStock(threshold = 3) {
    return this.db.stock.findMany({
      where: { quantity: { lte: threshold } },
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { quantity: 'asc' },
    });
  }

  async updateVariantStock(productId: string, size: string, colorName: string, quantity: number) {
    return this.db.stock.updateMany({
      where: { productId, size, colorName },
      data: { quantity },
    });
  }
}
