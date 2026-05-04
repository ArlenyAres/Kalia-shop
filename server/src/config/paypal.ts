const isProduction = process.env.NODE_ENV === 'production';

export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID ?? '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
  mode: isProduction ? 'live' : 'sandbox',
  baseUrl: isProduction
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com',
};
