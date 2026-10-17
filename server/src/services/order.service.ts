import { randomInt } from 'crypto';
import type { OrderStatus, PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import type { CheckoutRequest } from '../validation/schemas.js';
import { EmailService } from './email.service.js';
import { InventoryService } from './inventory.service.js';

export const SHIPPING_COST = 0;

// Estados en los que el stock del pedido ya no está comprometido.
const RELEASED_STATUSES: OrderStatus[] = ['cancelled', 'payment_failed', 'refunded'];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** KAL-2026-7KQ2MX: aleatorio en vez de contar pedidos, así no hay carreras entre compras simultáneas. */
export function generateOrderNumber(date = new Date()): string {
  const suffix = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `KAL-${date.getFullYear()}-${suffix}`;
}

export class OrderService {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly inventory = new InventoryService(db),
    private readonly email = new EmailService(),
  ) {}

  async createOrder(input: CheckoutRequest) {
    const productIds = [...new Set(input.items.map((i) => i.productId))];

    const order = await this.db.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, name: true, price: true, images: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      const lines = input.items.map((item) => {
        const product = byId.get(item.productId);
        if (!product) throw new ValidationError(`Producto no disponible: ${item.productId}`);
        return { ...item, product };
      });

      const skus = await this.inventory.reserveStock(
        tx,
        lines.map((l) => ({ productId: l.productId, size: l.size, colorName: l.color, quantity: l.quantity })),
      );

      const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          guestEmail: input.shippingAddress.email,
          status: 'pending',
          paymentMethod: input.paymentMethod,
          subtotal,
          shippingCost: SHIPPING_COST,
          total: subtotal + SHIPPING_COST,
          shippingAddress: input.shippingAddress,
          items: {
            create: lines.map((l, i) => ({
              productId: l.productId,
              productName: l.product.name,
              imageUrl: l.product.images[0] ?? '',
              color: l.color,
              size: l.size,
              sku: skus[i],
              price: l.product.price,
              quantity: l.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    // El email no debe tumbar un pedido ya creado.
    this.email.sendOrderConfirmation(order).catch((err: unknown) => {
      logger.error('Order confirmation email failed', { orderId: order.id, err });
    });

    logger.info('Order created', { orderId: order.id, orderNumber: order.orderNumber });
    return order;
  }

  async listOrders({ page, limit, status }: { page: number; limit: number; status?: OrderStatus }) {
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.db.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.db.order.count({ where }),
    ]);
    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOrderById(id: string) {
    const order = await this.db.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    return this.db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const current = await this.db.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!current) throw new NotFoundError('Order not found');

    const order = await this.db.order.update({
      where: { id: orderId },
      data: { status },
    });

    if (RELEASED_STATUSES.includes(status) && !RELEASED_STATUSES.includes(current.status)) {
      await this.inventory.releaseStock(orderId);
    }

    logger.info('Order status updated', { orderId, from: current.status, status });
    return order;
  }

  async updateTracking(orderId: string, trackingNumber: string) {
    const order = await this.db.order.update({ where: { id: orderId }, data: { trackingNumber } });
    logger.info('Order tracking updated', { orderId, trackingNumber });
    return order;
  }
}
