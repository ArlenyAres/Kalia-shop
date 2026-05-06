import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product.types';

vi.mock('../services/products.service');

import { productsService } from '../services/products.service';

const mockGetAll = vi.mocked(productsService.getAll);
const mockGetByCategory = vi.mocked(productsService.getByCategory);

const fakeProducts: Product[] = [
  {
    id: 'b1',
    name: 'Aurelia Set',
    slug: 'aurelia-set',
    description: 'Test description',
    shortDescription: 'Short desc',
    category: 'bikini',
    price: 14500,
    compareAtPrice: 18000,
    images: ['https://example.com/img.jpg'],
    colors: [{ name: 'Sage Shore', hex: '#80917d' }],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['best-seller'],
    isActive: true,
    isFeatured: true,
    careInstructions: 'Lavar a mano',
    composition: '78% poliamida',
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
];

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true while fetching', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
  });

  it('returns products array on success', async () => {
    mockGetAll.mockResolvedValue({
      products: fakeProducts,
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].slug).toBe('aurelia-set');
    expect(result.current.error).toBeNull();
  });

  it('returns error on service failure', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.products).toHaveLength(0);
  });

  it('refetches when category changes', async () => {
    mockGetAll.mockResolvedValue({
      products: fakeProducts,
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    mockGetByCategory.mockResolvedValue(fakeProducts);

    const { result, rerender } = renderHook(
      ({ category }: { category?: 'bikini' | 'completo' | 'trikini' }) =>
        useProducts(category),
      { initialProps: { category: undefined } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetAll).toHaveBeenCalledTimes(1);

    rerender({ category: 'bikini' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetByCategory).toHaveBeenCalledWith('bikini');
  });
});
