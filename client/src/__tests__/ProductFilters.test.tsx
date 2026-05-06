import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ProductFilters } from '../components/ProductFilters';
import type { ProductSize } from '../types/product.types';

const ALL_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

describe('ProductFilters', () => {
  it('size filter buttons render for all sizes', () => {
    render(
      <ProductFilters
        sizes={ALL_SIZES}
        selectedSize={null}
        onSizeChange={vi.fn()}
        selectedSort={undefined}
        onSortChange={vi.fn()}
      />,
    );
    for (const size of ALL_SIZES) {
      expect(screen.getByRole('button', { name: size })).toBeInTheDocument();
    }
  });

  it('clicking size calls onChange with correct value', () => {
    const onSizeChange = vi.fn();
    render(
      <ProductFilters
        sizes={ALL_SIZES}
        selectedSize={null}
        onSizeChange={onSizeChange}
        selectedSort={undefined}
        onSortChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'M' }));
    expect(onSizeChange).toHaveBeenCalledWith('M');
  });

  it('selected size has active class', () => {
    render(
      <ProductFilters
        sizes={ALL_SIZES}
        selectedSize="L"
        onSizeChange={vi.fn()}
        selectedSort={undefined}
        onSortChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'L' })).toHaveClass('size-btn--active');
    expect(screen.getByRole('button', { name: 'M' })).not.toHaveClass('size-btn--active');
  });

  it('sort dropdown emits correct value', () => {
    const onSortChange = vi.fn();
    render(
      <ProductFilters
        sizes={ALL_SIZES}
        selectedSize={null}
        onSizeChange={vi.fn()}
        selectedSort={undefined}
        onSortChange={onSortChange}
      />,
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar por' }), { target: { value: 'price_asc' } });
    expect(onSortChange).toHaveBeenCalledWith('price_asc');
  });

  it('clearing sort select calls onSortChange with undefined', () => {
    const onSortChange = vi.fn();
    render(
      <ProductFilters
        sizes={ALL_SIZES}
        selectedSize={null}
        onSizeChange={vi.fn()}
        selectedSort="featured"
        onSortChange={onSortChange}
      />,
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Ordenar por' }), { target: { value: '' } });
    expect(onSortChange).toHaveBeenCalledWith(undefined);
  });
});
