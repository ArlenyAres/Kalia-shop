import api from './api';
import type { Product, ProductCategory, ProductSize } from '../types/product.types';
import type { Order, OrderStatus } from '../types/order.types';

export interface LowStockItem {
  productId: string;
  productName: string;
  size: ProductSize;
  colorName: string;
  quantity: number;
}

export interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  recentOrders: Order[];
  lowStock: LowStockItem[];
}

export interface CreateProductData {
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  description: string;
  shortDescription: string;
  composition: string;
  careInstructions: string;
  colors: { name: string; hex: string; imageUrl?: string }[];
  availableSizes: ProductSize[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  stock: { size: ProductSize; colorName: string; quantity: number }[];
}

export type UpdateProductData = Partial<CreateProductData>;

// Products
export const getProducts = () =>
  api.get<{ products: Product[]; pagination: unknown }>('/admin/products').then((r) => r.data.products);

export const createProduct = (data: CreateProductData) =>
  api.post<Product>('/admin/products', data).then((r) => r.data);

export const updateProduct = (id: string, data: UpdateProductData) =>
  api.put<Product>(`/admin/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: string) =>
  api.delete(`/admin/products/${id}`);

export const updateStock = (id: string, size: string, colorName: string, quantity: number) =>
  api.patch(`/admin/products/${id}/stock`, { size, colorName, quantity });

export const uploadImages = (id: string, files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('images', f));
  return api.post<{ images: string[] }>(`/admin/products/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

// Orders
export const getOrders = (page?: number, status?: OrderStatus) =>
  api.get<{ orders: Order[]; pagination: unknown }>('/admin/orders', { params: { page, status } }).then((r) => r.data.orders);

export const getOrder = (id: string) =>
  api.get<Order>(`/admin/orders/${id}`).then((r) => r.data);

export const updateOrderStatus = (id: string, status: OrderStatus) =>
  api.patch<Order>(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

export const updateTracking = (id: string, trackingNumber: string) =>
  api.patch<Order>(`/admin/orders/${id}/tracking`, { trackingNumber }).then((r) => r.data);

// Dashboard
export const getDashboard = () =>
  api.get<DashboardData>('/admin/dashboard').then((r) => r.data);
