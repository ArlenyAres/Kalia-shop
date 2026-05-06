import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ProductForm } from '../components/admin/ProductForm';

const { mockApiPost } = vi.hoisted(() => ({
  mockApiPost: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: { post: mockApiPost },
}));

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('ProductForm', () => {
  it('slug auto-generates from product name input', async () => {
    render(<ProductForm />);
    await userEvent.type(screen.getByLabelText('Nombre'), 'Aurelia Set');
    await waitFor(() => {
      const slugInput = screen.getByLabelText('Slug') as HTMLInputElement;
      expect(slugInput.value).toBe('aurelia-set');
    });
  });

  it('form requires name, category, price before submit', async () => {
    render(<ProductForm />);
    fireEvent.submit(screen.getByRole('button', { name: /guardar producto/i }));
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('stock table renders rows for each size×color combination', () => {
    render(
      <ProductForm
        initialColors={['Sage', 'Ebony']}
        initialSizes={['S', 'M', 'L']}
      />,
    );
    const table = screen.getByRole('table', { name: /stock por variante/i });
    const rows = table.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(6); // 2 colors × 3 sizes
  });

  it('image upload zone accepts image files', () => {
    render(<ProductForm />);
    const fileInput = screen.getByLabelText('Imágenes') as HTMLInputElement;
    expect(fileInput.type).toBe('file');
    expect(fileInput.accept).toBe('image/*');
  });

  it('submits correct payload to API', async () => {
    mockApiPost.mockResolvedValue({ data: { id: 'new-prod-1' } });
    render(
      <ProductForm
        initialColors={['Sage']}
        initialSizes={['S']}
      />,
    );
    await userEvent.type(screen.getByLabelText('Nombre'), 'Nerina Set');
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'bikini');
    await userEvent.type(screen.getByLabelText('Precio'), '12800');
    fireEvent.submit(screen.getByRole('button', { name: /guardar producto/i }));
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/admin/products',
        expect.objectContaining({
          name: 'Nerina Set',
          slug: 'nerina-set',
          category: 'bikini',
          price: 12800,
        }),
      );
    });
  });
});
