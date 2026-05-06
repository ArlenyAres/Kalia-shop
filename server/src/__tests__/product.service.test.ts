jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import prisma from '../config/database';
import { ProductService } from '../services/product.service';
import { NotFoundError } from '../utils/errors';

const mockProduct = (prisma.product as unknown) as {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  count: jest.Mock;
};

const fakeProduct = {
  id: 'prod-1',
  name: 'Aurelia Set',
  slug: 'aurelia-set',
  description: 'A bandeau bikini',
  shortDescription: 'Refined bandeau bikini',
  category: 'bikini',
  price: 14500,
  compareAtPrice: 18000,
  images: [],
  colors: [],
  availableSizes: ['S', 'M'],
  tags: ['best-seller'],
  isActive: true,
  isFeatured: true,
  careInstructions: 'Hand wash',
  composition: '78% polyamide',
  stock: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated products', async () => {
      mockProduct.findMany.mockResolvedValue([fakeProduct]);
      mockProduct.count.mockResolvedValue(1);

      const result = await service.getAll({ page: 1, limit: 12 });

      expect(result.products).toEqual([fakeProduct]);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(mockProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 12 }),
      );
    });
  });

  describe('getBySlug', () => {
    it('returns product when found', async () => {
      mockProduct.findUnique.mockResolvedValue(fakeProduct);

      const result = await service.getBySlug('aurelia-set');

      expect(result).toEqual(fakeProduct);
      expect(mockProduct.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'aurelia-set' } }),
      );
    });

    it('throws NotFoundError when product does not exist', async () => {
      mockProduct.findUnique.mockResolvedValue(null);

      await expect(service.getBySlug('unknown-slug')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError when product is inactive', async () => {
      mockProduct.findUnique.mockResolvedValue({ ...fakeProduct, isActive: false });

      await expect(service.getBySlug('aurelia-set')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('persists product with correct slug from name', async () => {
      const created = { ...fakeProduct, id: 'new-id' };
      mockProduct.create.mockResolvedValue(created);

      const result = await service.create({
        name: 'Aurelia Set',
        slug: 'aurelia-set',
        description: 'desc',
        shortDescription: 'short',
        category: 'bikini',
        price: 14500,
        images: [],
        colors: [],
        availableSizes: [],
        tags: [],
        isActive: true,
        isFeatured: false,
        careInstructions: 'Hand wash',
        composition: '78% polyamide',
      } as unknown as Parameters<typeof service.create>[0]);

      expect(result).toEqual(created);
      const callArg = mockProduct.create.mock.calls[0][0] as { data: { slug: string } };
      expect(callArg.data.slug).toBe('aurelia-set');
    });
  });

  describe('softDelete', () => {
    it('sets isActive to false without deleting', async () => {
      mockProduct.update.mockResolvedValue({ ...fakeProduct, isActive: false });

      await service.softDelete('prod-1');

      expect(mockProduct.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { isActive: false },
      });
    });
  });

  describe('getFeatured', () => {
    it('returns only isFeatured: true products', async () => {
      const featuredProduct = { ...fakeProduct, isFeatured: true };
      mockProduct.findMany.mockResolvedValue([featuredProduct]);

      const result = await service.getFeatured();

      expect(result).toEqual([featuredProduct]);
      expect(mockProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isFeatured: true, isActive: true } }),
      );
    });
  });
});
