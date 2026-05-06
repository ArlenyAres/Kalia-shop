import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockNavigate, mockApiPost, mockToastError } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockApiPost: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [
      {
        productId: 'p1',
        productName: 'Aurelia Set',
        imageUrl: 'https://example.com/img.jpg',
        slug: 'aurelia-set',
        color: 'Sage Shore',
        size: 'S',
        sku: 'KAL-AUR-SS-S',
        price: 14500,
        quantity: 1,
      },
    ],
    subtotal: 14500,
    clearCart: vi.fn(),
  }),
}));

vi.mock('../services/api', () => ({
  default: { post: mockApiPost },
}));

vi.mock('react-hot-toast', () => ({
  default: { error: mockToastError, success: vi.fn() },
}));

import { CheckoutPage } from '../pages/CheckoutPage';

function renderCheckout() {
  return render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>,
  );
}

async function fillRequiredFields() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nombre'), 'Ana');
  await user.type(screen.getByLabelText('Apellido'), 'García');
  await user.type(screen.getByLabelText('Email'), 'ana@test.com');
  await user.type(screen.getByLabelText('Dirección'), 'Calle Delpín 12');
  await user.type(screen.getByLabelText('Ciudad'), 'Santo Domingo');
  await user.type(screen.getByLabelText('Estado / Provincia'), 'DN');
  await user.type(screen.getByLabelText('Código postal'), '10100');
  await user.type(screen.getByLabelText('País'), 'DO');
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('form validates required fields before submit', async () => {
    renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /confirmar pedido/i }));
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it('PayPal section renders when paypal selected', () => {
    renderCheckout();
    expect(screen.getByRole('region', { name: /pago con paypal/i })).toBeInTheDocument();
  });

  it('Card section renders when card selected', async () => {
    renderCheckout();
    await userEvent.click(screen.getByRole('button', { name: /tarjeta/i }));
    expect(screen.getByRole('region', { name: /pago con tarjeta/i })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /pago con paypal/i })).not.toBeInTheDocument();
  });

  it('shows loading overlay during payment processing', async () => {
    mockApiPost.mockReturnValue(new Promise(() => {}));
    renderCheckout();
    await fillRequiredFields();
    fireEvent.submit(screen.getByRole('button', { name: /confirmar pedido/i }));
    await waitFor(() => {
      expect(screen.getByRole('status', { name: /procesando pago/i })).toBeInTheDocument();
    });
  });

  it('redirects to /confirmacion/:orderNumber on success', async () => {
    mockApiPost.mockResolvedValue({ data: { orderNumber: 'KAL-2026-001' } });
    renderCheckout();
    await fillRequiredFields();
    fireEvent.submit(screen.getByRole('button', { name: /confirmar pedido/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/confirmacion/KAL-2026-001');
    });
  });

  it('shows error toast on payment failure', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'));
    renderCheckout();
    await fillRequiredFields();
    fireEvent.submit(screen.getByRole('button', { name: /confirmar pedido/i }));
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/error al procesar/i),
      );
    });
  });
});
