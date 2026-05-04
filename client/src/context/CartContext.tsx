import React, { createContext, useContext, useEffect, useReducer } from 'react';
import logger from '../utils/logger';
import type { CartContextValue, CartItem } from '../types/cart.types';

const STORAGE_KEY = 'kalia_cart';

type State = { items: CartItem[]; isDrawerOpen: boolean };
type Action =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { sku: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.sku === action.payload.sku);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.sku === action.payload.sku
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i,
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.sku !== action.payload) };
    case 'UPDATE_QTY':
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.sku !== action.payload.sku) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.sku === action.payload.sku ? { ...i, quantity: action.payload.quantity } : i,
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };
    default:
      return state;
  }
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    items: loadFromStorage(),
    isDrawerOpen: false,
  }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = (item: CartItem) => {
    logger.info('Cart: addItem', { sku: item.sku, qty: item.quantity });
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (sku: string) => {
    logger.info('Cart: removeItem', { sku });
    dispatch({ type: 'REMOVE_ITEM', payload: sku });
  };

  const updateQuantity = (sku: string, quantity: number) => {
    logger.info('Cart: updateQuantity', { sku, quantity });
    dispatch({ type: 'UPDATE_QTY', payload: { sku, quantity } });
  };

  const clearCart = () => {
    logger.info('Cart: clearCart');
    dispatch({ type: 'CLEAR' });
  };

  const openDrawer = () => dispatch({ type: 'OPEN_DRAWER' });
  const closeDrawer = () => dispatch({ type: 'CLOSE_DRAWER' });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
