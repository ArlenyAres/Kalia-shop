const mockPaymentIntentsCreate = jest.fn();

jest.mock('stripe', () => {
  const MockStripe = jest.fn().mockImplementation(() => ({
    paymentIntents: { create: mockPaymentIntentsCreate },
  }));
  return MockStripe;
});

const mockFetch = jest.fn();
(global as unknown as { fetch: jest.Mock }).fetch = mockFetch;

jest.mock('../config/paypal', () => ({
  paypalConfig: {
    clientId: 'test-client-id',
    clientSecret: 'test-secret',
    mode: 'sandbox',
    baseUrl: 'https://api-m.sandbox.paypal.com',
  },
}));

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), http: jest.fn() },
}));

import logger from '../utils/logger';
import { PaymentService } from '../services/payment.service';

const mockLogger = logger as jest.Mocked<typeof logger>;

function mockPayPalFlow(orderResponse: object) {
  mockFetch
    .mockResolvedValueOnce({ json: async () => ({ access_token: 'tok-123' }) })
    .mockResolvedValueOnce({ json: async () => orderResponse });
}

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
    jest.clearAllMocks();
  });

  describe('createPayPalOrder', () => {
    it('returns valid orderID format', async () => {
      mockPayPalFlow({ id: 'PAY-ABC123XYZ456' });

      const result = await service.createPayPalOrder(14500);

      expect(result.orderID).toBe('PAY-ABC123XYZ456');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('capturePayPalOrder', () => {
    it('returns capture status COMPLETED', async () => {
      mockPayPalFlow({ status: 'COMPLETED' });

      const result = await service.capturePayPalOrder('PAY-ABC123XYZ456');

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('createStripeIntent', () => {
    it('returns clientSecret string', async () => {
      mockPaymentIntentsCreate.mockResolvedValue({ client_secret: 'pi_test_secret_abc123' });

      const result = await service.createStripeIntent(14500);

      expect(result.clientSecret).toBe('pi_test_secret_abc123');
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 14500, currency: 'dop' }),
      );
    });

    it('logs error on Stripe failure', async () => {
      mockPaymentIntentsCreate.mockRejectedValue(new Error('Stripe API error'));

      await expect(service.createStripeIntent(14500)).rejects.toThrow('Stripe API error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Stripe createIntent failed',
        expect.anything(),
      );
    });
  });
});
