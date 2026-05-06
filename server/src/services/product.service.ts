import type { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import type { ProductFilters } from '../types/product.types.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class ProductService {
  async getAll(filters: ProductFilters = {}) {
    const { category, page = 1, limit = 12, sortBy = 'newest', tags } = filters;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && { category }),
      ...(tags && { tags: { hasSome: [tags] } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'price_asc'
        ? { price: 'asc' }
        : sortBy === 'price_desc'
          ? { price: 'desc' }
          : sortBy === 'featured'
            ? { isFeatured: 'desc' }
            : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { stock: true },
      }),
      prisma.product.count({ where }),
    ]);

    logger.info('Products fetched', { filters, total });

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { stock: true },
    });

    if (!product || !product.isActive) {
      logger.warn('Product not found', { slug });
      throw new NotFoundError(`Product not found: ${slug}`);
    }

    return product;
  }

  async getByCategory(category: string) {
    return prisma.product.findMany({
      where: { category: category as Prisma.EnumProductCategoryFilter['equals'], isActive: true },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeatured() {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: string) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
      include: { stock: true },
    });
  }

  async create(data: Prisma.ProductCreateInput & { stock?: Array<{ size: string; colorName: string; sku: string; quantity?: number }> }) {
    const { stock, ...productData } = data as typeof data & { stock?: Array<{ size: string; colorName: string; sku: string; quantity?: number }> };

    const slug = (productData.slug as string | undefined) ?? slugify(productData.name as string);

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        ...(stock && { stock: { create: stock } }),
      } as Prisma.ProductCreateInput,
      include: { stock: true },
    });

    logger.info('Product created', { id: product.id, name: product.name });
    return product;
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { stock: true },
    });

    logger.info('Product updated', { id });
    return product;
  }

  async softDelete(id: string) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    logger.info('Product deactivated', { id });
  }
}
