import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export interface OrderSummary {
  orderNumber: string;
  guestEmail?: string | null;
  total: number;
}

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT ?? 2525),
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  });

  async sendOrderConfirmation(order: OrderSummary): Promise<void> {
    const to = order.guestEmail;
    if (!to) return;

    await this.transporter.sendMail({
      from: '"Kalia" <noreply@kalia.shop>',
      to,
      subject: `Confirmación de pedido ${order.orderNumber}`,
      html: `<p>Tu pedido <strong>${order.orderNumber}</strong> ha sido recibido. Total: ${order.total}</p>`,
    });

    logger.info('Order confirmation email sent', { orderNumber: order.orderNumber, to });
  }
}
