import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductForm } from '../components/admin/ProductForm';

const { mockCreateProduct, mockGetProducts } = vi.hoisted(() => ({
  mockCreateProduct: vi.fn(),
  mockGetProducts: vi.fn().mockResolvedValue([]),
}));

vi.mock('../services/admin.service', () => ({
  createProduct: mockCreateProduct,
  updateProduct: vi.fn(),
  getProducts: mockGetProducts,
  uploadImages: vi.fn().mockResolvedValue({ images: [] }),
  deleteProduct: vi.fn(),
  updateStock: vi.fn(),
}));

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/admin/productos/nuevo']}>
      <Routes>
        <Route path="/admin/productos/nuevo" element={<ProductForm />} />
        <Route path="/admin/productos" element={<div>Products list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductForm', () => {
  it('slug auto-generates from product name input', async () => {
    renderCreate();
    await userEvent.type(screen.getByLabelText('Nombre'), 'Aurelia Set');
    await waitFor(() => {
      const slugInput = screen.getByLabelText('Slug') as HTMLInputElement;
      expect(slugInput.value).toBe('aurelia-set');
    });
  });

  it('form requires name, category, price before submit', async () => {
    renderCreate();
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });
    expect(mockCreateProduct).not.toHaveBeenCalled();
  });

  it('size pills toggle correctly', async () => {
    renderCreate();
    const xsPill = screen.getByText('XS').closest('label');
    expect(xsPill).toBeTruthy();
    // XS is selected by default; clicking de-selects it
    await userEvent.click(xsPill!);
    const checkbox = xsPill!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('add color button shows a new color row', async () => {
    renderCreate();
    await userEvent.click(screen.getByRole('button', { name: /añadir color/i }));
    const colorInputs = screen.getAllByPlaceholderText('Nombre del color');
    expect(colorInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('submits correct payload to API on create', async () => {
    mockCreateProduct.mockResolvedValue({ id: 'new-prod-1' });
    const { container } = renderCreate();
    await userEvent.type(screen.getByLabelText('Nombre'), 'Nerina Set');
    // Wait for slug to be auto-generated before proceeding
    await waitFor(() => {
      const slugInput = screen.getByLabelText('Slug') as HTMLInputElement;
      expect(slugInput.value).toBe('nerina-set');
    });
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'bikini');
    // Use fireEvent.change for number inputs to reliably set valueAsNumber in jsdom
    fireEvent.change(screen.getByLabelText(/precio \(€\)/i), {
      target: { value: '128', valueAsNumber: 128 },
    });
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nerina Set',
          slug: 'nerina-set',
          category: 'bikini',
        }),
      );
    });
  });
});
