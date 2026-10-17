import type { Product, ProductCategory, ProductSize } from '../types/product.types';

export const CATEGORIES: ProductCategory[] = ['bikini', 'completo', 'trikini'];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bikini: 'Bikinis',
  completo: 'Completos',
  trikini: 'Trikinis',
};

export const CATEGORY_LABELS_SINGULAR: Record<ProductCategory, string> = {
  bikini: 'Bikini',
  completo: 'Completo',
  trikini: 'Trikini',
};

/** Clave de la línea del carrito; el SKU real lo asigna el servidor al crear el pedido. */
export function cartSku(productId: string, size: string, colorName: string): string {
  return `${productId}-${size}-${colorName.replace(/\s/g, '')}`;
}

/**
 * Sin datos de stock (catálogo de demo) todo está disponible.
 * Con stock del API, solo las variantes con unidades.
 */
export function isVariantAvailable(product: Product, size: ProductSize, colorName: string): boolean {
  if (!product.stock?.length) return true;
  return product.stock.some((s) => s.size === size && s.colorName === colorName && s.quantity > 0);
}
