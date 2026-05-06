import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types/product.types';

const mockAddItem = vi.fn();

vi.mock('../context/CartContext', () => ({
  useCart: () => ({ addItem: mockAddItem }),
}));

const fakeProduct: Product = {
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
};

function renderCard(product: Product = fakeProduct) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  beforeEach(() => {
    mockAddItem.mockClear();
  });

  it('renders product name and price', () => {
    renderCard();
    expect(screen.getByText('Aurelia Set')).toBeInTheDocument();
    expect(screen.getByText(/14[\.,]500/)).toBeInTheDocument();
  });

  it('links to /product/:slug', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/aurelia-set');
  });

  it('shows SALE badge when compareAtPrice exists', () => {
    renderCard();
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('does not show SALE badge when compareAtPrice is absent', () => {
    renderCard({ ...fakeProduct, compareAtPrice: null, isFeatured: false });
    expect(screen.queryByText('Sale')).not.toBeInTheDocument();
  });

  it('calls addItem on quick-add interaction', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /añadir/i }));
    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'b1',
        productName: 'Aurelia Set',
        slug: 'aurelia-set',
        price: 14500,
        quantity: 1,
        sku: 'b1-XS-SageShore',
      }),
    );
  });
});
