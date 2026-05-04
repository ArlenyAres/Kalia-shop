export type OrderStatus =
  | 'pending'
  | 'payment_processing'
  | 'payment_failed'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'paypal' | 'card';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string;
  slug: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  notes?: string | null;
  trackingNumber?: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
