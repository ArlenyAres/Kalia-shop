import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import type { CartItem, OrderStatus, PaymentMethod, ShippingAddress } from '../types/order.types.js';
import { EmailService } from './email.service.js';
import { InventoryService } from './inventory.service.js';

export interface CreateOrderInput {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  guestEmail?: string;
}

const inventoryService = new InventoryService();
const emailService = new EmailService();

export class OrderService {
  async createOrder(data: CreateOrderInput) {
    const year = new Date().getFullYear();
    const count = await prisma.order.count();
    const orderNumber = `KAL-${year}-${String(count + 1).padStart(3, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: data.guestEmail,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        paymentId: data.paymentId,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        total: data.total,
        shippingAddress: data.shippingAddress as object,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            color: item.color,
            size: item.size,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await inventoryService.reserveStock(
      data.items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
      order.id,
    );

    await emailService.sendOrderConfirmation(order);

    logger.info('Order created', { orderId: order.id, orderNumber });
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    logger.info('Order status updated', { orderId, status });
    return order;
  }
}
