import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { InventoryService } from '../services/inventory.service';
import type { ProductFilters } from '../types/product.types';

const productService = new ProductService();
const inventoryService = new InventoryService();

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: ProductFilters = {
      category: req.query.category as ProductFilters['category'],
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sortBy: req.query.sortBy as ProductFilters['sortBy'],
      tags: req.query.tags as string | undefined,
    };
    res.json(await productService.getAll(filters));
  } catch (err) {
    next(err);
  }
};

export const getFeatured = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await productService.getFeatured());
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string) ?? '';
    res.json(await productService.search(q));
  } catch (err) {
    next(err);
  }
};

export const getByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await productService.getByCategory(req.params.category));
  } catch (err) {
    next(err);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await productService.getBySlug(req.params.slug));
  } catch (err) {
    next(err);
  }
};

// --- Admin handlers ---

export const adminGetProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: ProductFilters = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    res.json(await productService.getAll({ ...filters, ...({ isActive: undefined } as object) }));
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await productService.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.softDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { size, colorName, quantity } = req.body as { size: string; colorName: string; quantity: number };
    await inventoryService.updateVariantStock(req.params.id, size, colorName, quantity);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const uploadImages = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(501).json({ message: 'Image upload — coming in Phase 3' });
  } catch (err) {
    next(err);
  }
};
