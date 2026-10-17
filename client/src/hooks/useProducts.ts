import { useEffect, useState } from 'react';
import { productsService } from '../services/products.service';
import type { Product, ProductCategory } from '../types/product.types';

// La colección completa cabe en una página; si crece, pasar a paginación real.
const ALL_PRODUCTS_LIMIT = 100;

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(category?: ProductCategory): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = category
      ? productsService.getByCategory(category)
      : productsService.getAll({ limit: ALL_PRODUCTS_LIMIT }).then((r) => r.products);

    fetch
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { products, loading, error };
}
