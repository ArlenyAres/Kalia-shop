import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock CartContext so Navbar can render without a CartProvider
const mockOpenDrawer = vi.fn();
vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    itemCount: 0,
    isDrawerOpen: false,
    openDrawer: mockOpenDrawer,
    closeDrawer: vi.fn(),
  })),
}));

import { useCart } from '../context/CartContext';
import { Navbar } from '../components/layout/Navbar';

const mockUseCart = useCart as ReturnType<typeof vi.fn>;

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCart.mockReturnValue({
      itemCount: 0,
      isDrawerOpen: false,
      openDrawer: mockOpenDrawer,
      closeDrawer: vi.fn(),
    });
  });

  it('renders KALIA logo', () => {
    renderNavbar();
    expect(screen.getByText('KALIA')).toBeDefined();
  });

  it('shows cart badge when itemCount > 0', () => {
    mockUseCart.mockReturnValue({ itemCount: 3, isDrawerOpen: false, openDrawer: mockOpenDrawer, closeDrawer: vi.fn() });
    renderNavbar();
    const badge = screen.getByText('3');
    expect(badge).toBeDefined();
  });

  it('hides badge when itemCount = 0', () => {
    renderNavbar();
    // badge should not appear for zero items
    const badge = screen.queryByText('0');
    expect(badge).toBeNull();
  });

  it('nav links render with correct hrefs', () => {
    renderNavbar();
    const bikinis = screen.getByText('BIKINIS');
    const completos = screen.getByText('COMPLETOS');
    const trikinis = screen.getByText('TRIKINIS');
    expect(bikinis.closest('a')?.getAttribute('href')).toBe('/collection/bikini');
    expect(completos.closest('a')?.getAttribute('href')).toBe('/collection/completo');
    expect(trikinis.closest('a')?.getAttribute('href')).toBe('/collection/trikini');
  });

  it('hamburger button is present in the DOM', () => {
    renderNavbar();
    const hamburger = screen.getByLabelText('Abrir menú');
    expect(hamburger).toBeDefined();
  });
});
