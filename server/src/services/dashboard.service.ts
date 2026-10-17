import type { PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';

const LOW_STOCK_THRESHOLD = 3;

export class DashboardService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getSummary() {
    const [totalProducts, totalOrders, recentOrders, lowStock] = await Promise.all([
      this.db.product.count({ where: { isActive: true } }),
      this.db.order.count(),
      this.db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
      }),
      this.db.stock.findMany({
        where: { quantity: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
        include: { product: { select: { name: true } } },
        orderBy: { quantity: 'asc' },
        take: 50,
      }),
    ]);

    return {
      totalProducts,
      totalOrders,
      recentOrders,
      // Forma que espera el panel: { productId, productName, size, colorName, quantity }
      lowStock: lowStock.map((s) => ({
        productId: s.productId,
        productName: s.product.name,
        size: s.size,
        colorName: s.colorName,
        quantity: s.quantity,
      })),
    };
  }
}
