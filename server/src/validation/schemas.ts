import { z } from 'zod';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const CATEGORIES = ['bikini', 'completo', 'trikini'] as const;
const ORDER_STATUSES = [
  'pending',
  'payment_processing',
  'payment_failed',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

const cents = z.number().int().nonnegative();

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

// ── Productos (admin) ─────────────────────────────────────────────────────
const stockEntry = z.object({
  size: z.enum(SIZES),
  colorName: z.string().min(1).max(60),
  sku: z.string().min(1).max(80),
  quantity: z.number().int().nonnegative().default(0),
});

export const productCreateSchema = z
  .object({
    name: z.string().min(1).max(120),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido')
      .max(120)
      .optional(),
    description: z.string().max(5000).default(''),
    shortDescription: z.string().max(300).default(''),
    category: z.enum(CATEGORIES),
    price: cents,
    compareAtPrice: cents.nullable().optional(),
    images: z.array(z.string().url()).max(10).default([]),
    colors: z
      .array(
        z.object({
          name: z.string().min(1).max(60),
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          imageUrl: z.string().url().optional(),
        }),
      )
      .max(12)
      .default([]),
    availableSizes: z.array(z.enum(SIZES)).default([]),
    tags: z.array(z.string().max(40)).max(20).default([]),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    careInstructions: z.string().max(1000).default(''),
    composition: z.string().max(300).default(''),
    stock: z.array(stockEntry).max(200).optional(),
  })
  .strict();

// En el update no se aplican defaults: solo se modifica lo que llega.
export const productUpdateSchema = productCreateSchema
  .extend({
    description: z.string().max(5000),
    shortDescription: z.string().max(300),
    images: z.array(z.string().url()).max(10),
    careInstructions: z.string().max(1000),
    composition: z.string().max(300),
  })
  .partial()
  .strict();

export const stockUpdateSchema = z.object({
  size: z.enum(SIZES),
  colorName: z.string().min(1).max(60),
  quantity: z.number().int().nonnegative(),
});

export const productListQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'featured']).optional(),
  tags: z.string().max(40).optional(),
});

export const categoryParamSchema = z.object({ category: z.enum(CATEGORIES) });

export const searchQuerySchema = z.object({ q: z.string().trim().max(100).default('') });

// ── Pedidos ───────────────────────────────────────────────────────────────
export const orderStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export const trackingSchema = z.object({ trackingNumber: z.string().trim().min(1).max(100) });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const orderListQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
});

// El cliente solo indica QUÉ compra; precios y totales se calculan en el servidor.
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(64),
        size: z.enum(SIZES),
        color: z.string().min(1).max(60),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
  shippingAddress: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().email().max(254),
    phone: z.string().max(40).optional(),
    street: z.string().trim().min(1).max(200),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    zip: z.string().trim().min(1).max(20),
    country: z.string().trim().min(1).max(100),
  }),
  paymentMethod: z.enum(['paypal', 'card']),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
