import api from './api';
import logger from '../utils/logger';
import type { PaginatedProducts, Product, ProductFilters } from '../types/product.types';
import {
  FEATURED_PRODUCTS,
  getByCategory as mockByCategory,
  getBySlug as mockBySlug,
  MOCK_PRODUCTS,
} from '../data/mockProducts';

export const productsService = {
  async getAll(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    logger.info('products.getAll', filters);
    try {
      const { data } = await api.get<PaginatedProducts>('/products', { params: filters });
      if (data && Array.isArray(data.products)) return data;
    } catch (err) {
      logger.warn('products.getAll – usando mock', { err });
    }
    const { category, page = 1, limit = 12 } = filters;
    const all = category ? MOCK_PRODUCTS.filter((p) => p.category === category) : MOCK_PRODUCTS;
    const total = all.length;
    return {
      products: all.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getBySlug(slug: string): Promise<Product> {
    logger.info('products.getBySlug', { slug });
    try {
      const { data } = await api.get<Product>(`/products/${slug}`);
      if (data && data.id) return data;
    } catch (err) {
      logger.warn('products.getBySlug – usando mock', { err });
    }
    const product = mockBySlug(slug);
    if (!product) throw new Error(`Product not found: ${slug}`);
    return product;
  },

  async getByCategory(category: string): Promise<Product[]> {
    logger.info('products.getByCategory', { category });
    try {
      const { data } = await api.get<Product[]>(`/products/category/${category}`);
      if (Array.isArray(data)) return data;
    } catch (err) {
      logger.warn('products.getByCategory – usando mock', { err });
    }
    return mockByCategory(category);
  },

  async getFeatured(): Promise<Product[]> {
    logger.info('products.getFeatured');
    try {
      const { data } = await api.get<Product[]>('/products/featured');
      if (Array.isArray(data)) return data;
    } catch (err) {
      logger.warn('products.getFeatured – usando mock', { err });
    }
    return FEATURED_PRODUCTS;
  },

  async search(query: string): Promise<Product[]> {
    logger.info('products.search', { query });
    try {
      const { data } = await api.get<Product[]>('/products/search', { params: { q: query } });
      if (Array.isArray(data)) return data;
    } catch (err) {
      logger.warn('products.search – usando mock', { err });
    }
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)),
    );
  },
};
