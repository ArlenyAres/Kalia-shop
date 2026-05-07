import Stripe from 'stripe';
import { paypalConfig } from '../config/paypal.js';
import logger from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder');

async function getPayPalToken(): Promise<string> {
  const creds = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`,
  ).toString('base64');

  const res = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export class PaymentService {
  async createPayPalOrder(total: number): Promise<{ orderID: string }> {
    const token = await getPayPalToken();

    const res = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          { amount: { currency_code: 'DOP', value: (total / 100).toFixed(2) } },
        ],
      }),
    });

    const data = (await res.json()) as { id: string };
    logger.info('PayPal order created', { orderID: data.id });
    return { orderID: data.id };
  }

  async capturePayPalOrder(orderID: string): Promise<{ status: string }> {
    const token = await getPayPalToken();

    const res = await fetch(
      `${paypalConfig.baseUrl}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = (await res.json()) as { status: string };
    logger.info('PayPal order captured', { orderID, status: data.status });
    return { status: data.status };
  }

  async createStripeIntent(amount: number): Promise<{ clientSecret: string }> {
    try {
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'dop',
        automatic_payment_methods: { enabled: true },
      });

      if (!intent.client_secret) throw new Error('Missing client_secret from Stripe');
      return { clientSecret: intent.client_secret };
    } catch (err) {
      logger.error('Stripe createIntent failed', { err });
      throw err;
    }
  }
}
