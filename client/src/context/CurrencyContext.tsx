import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Currency = 'USD' | 'EUR';

export const CURRENCIES: Currency[] = ['USD', 'EUR'];

// Los precios se guardan en centavos de USD. Tasa fija para la demo;
// en producción vendría de un endpoint o se guardarían precios por moneda.
const RATES: Record<Currency, number> = { USD: 1, EUR: 0.92 };

const LOCALES: Record<Currency, string> = { USD: 'en-US', EUR: 'es-ES' };

const STORAGE_KEY = 'kalia_currency';

const formatters = Object.fromEntries(
  CURRENCIES.map((c) => [
    c,
    new Intl.NumberFormat(LOCALES[c], {
      style: 'currency',
      currency: c,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
  ]),
) as Record<Currency, Intl.NumberFormat>;

/** Formatea un importe en centavos de USD en la moneda indicada. */
export function formatPrice(cents: number, currency: Currency = 'USD'): string {
  return formatters[currency].format((cents / 100) * RATES[currency]);
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (cents: number) => string;
}

function loadCurrency(): Currency {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'EUR' ? 'EUR' : 'USD';
  } catch {
    return 'USD';
  }
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(loadCurrency);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // almacenamiento no disponible: la preferencia vive solo en memoria
    }
  }, [currency]);

  const format = useCallback((cents: number) => formatPrice(cents, currency), [currency]);

  const value = useMemo(() => ({ currency, setCurrency, format }), [currency, format]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

const fallback: CurrencyContextValue = {
  currency: 'USD',
  setCurrency: () => {},
  format: (cents) => formatPrice(cents, 'USD'),
};

/** Fuera del provider (tests, componentes aislados) formatea en USD. */
export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext) ?? fallback;
}
