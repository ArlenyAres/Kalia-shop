import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ProductService } from '../services/product.service.js';
import { InventoryService } from '../services/inventory.service.js';
import cloudinary from '../config/cloudinary.js';
import type { ProductFilters } from '../types/product.types.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// La extensión sale del MIME validado, nunca del nombre que manda el cliente.
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'demo';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_IMAGE_TYPES.has(file.mimetype)),
});

const productService = new ProductService();
const inventoryService = new InventoryService();

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.query ya viene validado por productListQuerySchema
    res.json(await productService.getAll(req.query as ProductFilters));
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
    res.json(await productService.search(req.query.q as string));
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
    const { page, limit } = req.query as { page?: number; limit?: number };
    // El panel necesita ver también los productos desactivados.
    res.json(await productService.getAll({ page, limit, includeInactive: true }));
  } catch (err) {
    next(err);
  }
};

export const adminGetProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await productService.getById(req.params.id as string));
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
      const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
      urls = files.map((file) => {
        const ext = EXTENSIONS[file.mimetype] ?? '.jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);
        return `${baseUrl}/uploads/${filename}`;
      });
    }

    const product = await productService.appendImages(req.params.id as string, urls);

    res.json({ images: product.images });
  } catch (err) {
    next(err);
  }
};
