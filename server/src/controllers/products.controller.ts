import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ProductService } from '../services/product.service.js';
import { InventoryService } from '../services/inventory.service.js';
import cloudinary from '../config/cloudinary.js';
import type { ProductFilters } from '../types/product.types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'demo';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
    res.json(await productService.getByCategory(req.params.category as string));
  } catch (err) {
    next(err);
  }
};

export const getBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await productService.getBySlug(req.params.slug as string));
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
    res.json(await productService.update(req.params.id as string, req.body));
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.softDelete(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { size, colorName, quantity } = req.body as { size: string; colorName: string; quantity: number };
    await inventoryService.updateVariantStock(req.params.id as string, size, colorName, quantity);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) {
      res.status(400).json({ error: 'BadRequest', message: 'No images provided' });
      return;
    }

    let urls: string[];

    if (cloudinaryConfigured) {
      urls = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: 'kalia/products', resource_type: 'image' },
                (err, result) => {
                  if (err || !result) return reject(err ?? new Error('Upload failed'));
                  resolve(result.secure_url);
                },
              );
              stream.end(file.buffer);
            }),
        ),
      );
    } else {
      // Local storage fallback for development
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      const port = process.env.PORT ?? 4000;
      urls = files.map((file) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);
        return `http://localhost:${port}/uploads/${filename}`;
      });
    }

    const product = await productService.update(req.params.id as string, {
      images: urls,
    });

    res.json({ images: product.images });
  } catch (err) {
    next(err);
  }
};
