import { isAxiosError } from 'axios';
import api from './api';
import logger from '../utils/logger';
import type { CartItem } from '../types/cart.types';
import type { PaymentMethod, ShippingAddress } from '../types/order.types';

export interface CheckoutInput {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface PlacedOrder extends CheckoutInput {
  orderNumber: string;
  createdAt: string;
  isDemo: boolean;
}

const LAST_ORDER_KEY = 'kalia_last_order';

// Sin backend (p. ej. demo en Vercel) el endpoint responde 404 y simulamos el pedido.
// VITE_DEMO_MODE=false desactiva la simulación.
const demoEnabled = import.meta.env.VITE_DEMO_MODE !== 'false';

function demoOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `KAL-${year}-D${suffix}`;
}

function saveLastOrder(order: PlacedOrder) {
  try {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // sin almacenamiento la confirmación muestra solo el número de pedido
  }
}

export function getLastOrder(orderNumber: string): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    const order = raw ? (JSON.parse(raw) as PlacedOrder) : null;
    return order?.orderNumber === orderNumber ? order : null;
  } catch {
    return null;
  }
}

export const ordersService = {
  async checkout(input: CheckoutInput): Promise<PlacedOrder> {
    let order: PlacedOrder;
    try {
      const { data } = await api.post<{ orderNumber: string }>('/checkout', {
        ...input,
        guestEmail: input.shippingAddress.email,
      });
      order = { ...input, orderNumber: data.orderNumber, createdAt: new Date().toISOString(), isDemo: false };
    } catch (err) {
      if (!(demoEnabled && isAxiosError(err) && err.response?.status === 404)) throw err;
      logger.warn('orders.checkout – endpoint no disponible, pedido simulado');
      order = { ...input, orderNumber: demoOrderNumber(), createdAt: new Date().toISOString(), isDemo: true };
    }
    saveLastOrder(order);
    return order;
  },
};
