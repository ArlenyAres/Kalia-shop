import { beforeEach, describe, expect, it, vi } from 'vitest';

// Capture interceptor handlers as they are registered
const captured = vi.hoisted(() => ({
  requestFn: null as null | ((c: Record<string, unknown>) => Record<string, unknown>),
  responseFulfilled: null as null | ((r: unknown) => unknown),
  responseRejected: null as null | ((e: unknown) => Promise<never>),
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      interceptors: {
        request: {
          use: (fn: (c: Record<string, unknown>) => Record<string, unknown>) => {
            captured.requestFn = fn;
          },
        },
        response: {
          use: (ok: (r: unknown) => unknown, err: (e: unknown) => Promise<never>) => {
            captured.responseFulfilled = ok;
            captured.responseRejected = err;
          },
        },
      },
    }),
  },
}));

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Import after mocks so interceptors register into `captured`
await import('../services/api');
import logger from '../utils/logger';

const mockLogger = logger as unknown as { error: ReturnType<typeof vi.fn> };

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  // Reset window.location
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  });
});

describe('request interceptor', () => {
  it('attaches Authorization header when token exists in localStorage', () => {
    localStorage.setItem('kalia_token', 'jwt-abc-123');
    const config = { headers: {} as Record<string, string> };
    const result = captured.requestFn!(config) as typeof config;
    expect(result.headers.Authorization).toBe('Bearer jwt-abc-123');
  });

  it('does NOT attach header when no token', () => {
    const config = { headers: {} as Record<string, string> };
    const result = captured.requestFn!(config) as typeof config;
    expect(result.headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor', () => {
  it('calls logger.error on 500 response', async () => {
    const error = {
      response: { status: 500 },
      config: { url: '/api/products' },
    };
    await expect(captured.responseRejected!(error)).rejects.toEqual(error);
    expect(mockLogger.error).toHaveBeenCalledWith('API error', { url: '/api/products', status: 500 });
  });

  it('clears token and redirects on 401', async () => {
    localStorage.setItem('kalia_token', 'some-token');
    const error = {
      response: { status: 401 },
      config: { url: '/api/auth/me' },
    };
    await expect(captured.responseRejected!(error)).rejects.toEqual(error);
    expect(localStorage.getItem('kalia_token')).toBeNull();
    expect(window.location.href).toBe('/admin/login');
  });

  it('passes through successful responses unchanged', () => {
    const response = { data: { ok: true }, status: 200 };
    expect(captured.responseFulfilled!(response)).toEqual(response);
  });
});
