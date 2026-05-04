import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CartProvider, useCart } from '../context/CartContext';

// localStorage mock
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, val) => { store[key] = val; },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  key: (index) => Object.keys(store)[index] ?? null,
  get length() { return Object.keys(store).length; },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const fakeItem = {
  productId: 'p1',
  productName: 'Aurelia Set',
  imageUrl: 'https://example.com/img.jpg',
  slug: 'aurelia-set',
  color: 'Sage',
  size: 'S',
  sku: 'KAL-AUR-S-S',
  price: 145,
  quantity: 1,
};

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('addItem adds product to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].sku).toBe('KAL-AUR-S-S');
  });

  it('addItem increments quantity if same SKU already in cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    act(() => result.current.addItem({ ...fakeItem, quantity: 2 }));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it('removeItem removes by SKU', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    act(() => result.current.removeItem('KAL-AUR-S-S'));
    expect(result.current.items).toHaveLength(0);
  });

  it('updateQuantity changes quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    act(() => result.current.updateQuantity('KAL-AUR-S-S', 4));
    expect(result.current.items[0].quantity).toBe(4);
  });

  it('updateQuantity removes item when qty = 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    act(() => result.current.updateQuantity('KAL-AUR-S-S', 0));
    expect(result.current.items).toHaveLength(0);
  });

  it('clearCart empties items array', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    act(() => result.current.addItem({ ...fakeItem, sku: 'KAL-AUR-M-S', size: 'M' }));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
  });

  it('itemCount returns correct total units', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem({ ...fakeItem, quantity: 2 }));
    act(() => result.current.addItem({ ...fakeItem, sku: 'KAL-AUR-M-S', size: 'M', quantity: 3 }));
    expect(result.current.itemCount).toBe(5);
  });

  it('subtotal calculates price × quantity sum correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem({ ...fakeItem, price: 100, quantity: 2 }));
    act(() =>
      result.current.addItem({ ...fakeItem, sku: 'KAL-AUR-M-S', size: 'M', price: 200, quantity: 1 }),
    );
    expect(result.current.subtotal).toBe(400);
  });

  it('cart persists to localStorage on change', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(fakeItem));
    const stored = JSON.parse(localStorage.getItem('kalia_cart') ?? '[]') as typeof fakeItem[];
    expect(stored).toHaveLength(1);
    expect(stored[0].sku).toBe('KAL-AUR-S-S');
  });

  it('cart loads from localStorage on mount', () => {
    localStorage.setItem('kalia_cart', JSON.stringify([fakeItem]));
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].sku).toBe('KAL-AUR-S-S');
  });
});
