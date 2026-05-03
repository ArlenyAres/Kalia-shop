# Kalia

Luxury swimwear monorepo for a premium e-commerce experience.

## Structure

```
.
├── client/   # React 18 + TypeScript + Vite storefront
├── server/   # Node.js + Express + TypeScript API
└── prisma/   # Prisma schema and seed data
```

## Tech Stack

- Client: React 18, TypeScript, Vite, React Router DOM, Axios, React Hook Form, Zod, Stripe, PayPal, Framer Motion
- Server: Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, JWT, Stripe, Cloudinary, Nodemailer

## Getting Started

### 1. Install dependencies

In one terminal:

```bash
cd client
npm install
```

In another terminal:

```bash
cd server
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your secrets:

```bash
cd server
copy .env.example .env
```

Required variables include:

- `DATABASE_URL`
- `JWT_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`
- `VITE_API_URL`
- `VITE_PAYPAL_CLIENT_ID`
- `VITE_STRIPE_PUBLISHABLE_KEY`

### 3. Generate Prisma client and seed the database

From the `server` folder:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run the apps

Client:

```bash
cd client
npm run dev
```

Server:

```bash
cd server
npm run dev
```

## Notes

- The client already includes the requested folder structure under `src/`.
- The server includes a minimal Express app with security middleware and a health endpoint at `/api/health`.
- Prisma seed creates 5 sample swimwear products: 2 bikinis, 2 completos, and 1 trikini.
