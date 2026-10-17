import type { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import type { ProductFilters } from '../types/product.types.js';
import type { ProductCreateInput, ProductUpdateInput } from '../validation/schemas.js';

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
  constructor(private readonly db: PrismaClient = prisma) {}

  async getAll(filters: ProductFilters = {}) {
    const { category, page = 1, limit = 12, sortBy = 'newest', tags, includeInactive = false } = filters;

    const where: Prisma.ProductWhereInput = {
      ...(!includeInactive && { isActive: true }),
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
      this.db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { stock: true },
      }),
      this.db.product.count({ where }),
    ]);

    logger.info('Products fetched', { filters, total });

    return {
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBySlug(slug: string) {
    const product = await this.db.product.findUnique({
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
    return this.db.product.findMany({
      where: { category: category as Prisma.EnumProductCategoryFilter['equals'], isActive: true },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeatured() {
    return this.db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: string) {
    return this.db.product.findMany({
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

  async create(data: ProductCreateInput) {
    const { stock, slug, ...productData } = data;

    const product = await this.db.product.create({
      data: {
        ...productData,
        slug: slug ?? slugify(productData.name),
        ...(stock && { stock: { create: stock } }),
      },
      include: { stock: true },
    });

    logger.info('Product created', { id: product.id, name: product.name });
    return product;
  }

  async update(id: string, data: ProductUpdateInput) {
    const { stock, ...rest } = data;

    const product = await this.db.product.update({
      where: { id },
      data: {
        ...rest,
        ...(stock !== undefined && {
          stock: {
            deleteMany: {},
            create: stock,
          },
        }),
      },
      include: { stock: true },
    });

    logger.info('Product updated', { id });
    return product;
  }

  async softDelete(id: string) {
    await this.db.product.update({ where: { id }, data: { isActive: false } });
    logger.info('Product deactivated', { id });
  }
}
