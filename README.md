# Kalia

Tienda de ropa de baño de lujo — monorepo con storefront React y API REST en Node.js.

## Estructura del proyecto

```
.
├── client/          # Storefront React 18 + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── admin/       # AdminLayout, ProductForm
│       │   ├── layout/      # Navbar, Footer
│       │   └── ui/          # Button, CartDrawer, ProductFilters
│       ├── context/         # CartContext
│       ├── hooks/           # useProducts
│       ├── pages/
│       │   ├── admin/       # Dashboard, Productos, Pedidos, Login
│       │   └── ...          # HomePage, CollectionPage, ProductPage, CheckoutPage…
│       ├── services/        # api.ts, products.service.ts, admin.service.ts
│       ├── styles/          # globals.css, animations.css
│       └── types/           # cart, order, product, user
├── server/          # API Express + TypeScript
│   └── src/
│       ├── config/          # database, cloudinary, paypal
│       ├── controllers/     # auth, products
│       ├── middleware/      # auth, admin, errorHandler, validation
│       ├── routes/          # auth, products, admin
│       ├── services/        # product, order, payment, email, inventory
│       ├── types/           # order, product
│       └── utils/           # errors, logger
└── prisma/          # Schema y seed
```

## Stack tecnológico

### Cliente
| Capa | Librería |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router DOM 6 |
| Formularios | React Hook Form + Zod |
| HTTP | Axios |
| Iconos | Lucide React |
| Animaciones | Framer Motion |
| Pagos | Stripe, PayPal |

### Servidor
| Capa | Librería |
|---|---|
| Framework | Express 4 + TypeScript |
| ORM | Prisma 5 + PostgreSQL |
| Auth | JWT + bcryptjs |
| Subida de imágenes | Cloudinary + Multer |
| Email | Nodemailer |
| Pagos | Stripe, PayPal |
| Logs | Winston |
| Seguridad | Helmet, CORS, Rate Limiting |

## Modelos de base de datos

- **Product** — Productos con categoría (bikini / completo / trikini), colores, tallas, imágenes y flags `isActive` / `isFeatured`
- **Stock** — Inventario por variante (talla × color) con SKU único
- **Order** — Pedidos de invitados o usuarios registrados con estado y tracking
- **OrderItem** — Líneas de pedido con snapshot del producto
- **AdminUser** — Usuarios del panel de administración

## API endpoints

```
GET  /api/health

POST /api/auth/login
POST /api/auth/admin/login

GET  /api/products
GET  /api/products/:slug
GET  /api/products/category/:category
GET  /api/products/featured

GET     /api/admin/dashboard
GET     /api/admin/products
POST    /api/admin/products
PUT     /api/admin/products/:id
DELETE  /api/admin/products/:id
PATCH   /api/admin/products/:id/stock
POST    /api/admin/products/:id/images
GET     /api/admin/orders
GET     /api/admin/orders/:id
PATCH   /api/admin/orders/:id/status
PATCH   /api/admin/orders/:id/tracking
```

## Puesta en marcha

### 1. Instalar dependencias

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Variables de entorno

```bash
cd server
cp .env.example .env   # o copy en Windows
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `PORT` | Puerto del servidor (default 3000) |
| `CLIENT_URL` | URL del cliente (para CORS) |
| `PAYPAL_CLIENT_ID` | Client ID de PayPal |
| `PAYPAL_CLIENT_SECRET` | Secret de PayPal |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto de webhooks de Stripe |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |
| `SMTP_HOST` | Servidor SMTP para emails |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña SMTP |
| `VITE_API_URL` | URL base de la API (para el cliente) |
| `VITE_PAYPAL_CLIENT_ID` | Client ID de PayPal (para el cliente) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (para el cliente) |

### 3. Base de datos

```bash
cd server
npm run prisma:generate   # genera el cliente Prisma
npm run prisma:migrate    # ejecuta las migraciones
npm run prisma:seed       # carga productos de ejemplo
```

### 4. Crear usuario admin

```bash
node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
bcrypt.hash('TU_CONTRASEÑA', 10).then(hash =>
  prisma.adminUser.create({
    data: { email: 'admin@kalia.com', password: hash, name: 'Admin' }
  })
).then(u => { console.log('Creado:', u.email); prisma.\$disconnect(); });
"
```

### 5. Arrancar

```bash
# Servidor (http://localhost:3000)
cd server && npm run dev

# Cliente (http://localhost:5173)
cd client && npm run dev
```

El panel de administración está disponible en `http://localhost:5173/admin`.

## Scripts disponibles

### Cliente

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run test` | Tests con Vitest |
| `npm run test:ui` | Vitest con interfaz visual |
| `npm run test:coverage` | Cobertura de tests |

### Servidor

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga automática (tsx watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Ejecutar build compilado |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run prisma:migrate` | Ejecutar migraciones |
| `npm run prisma:seed` | Poblar la base de datos |
| `npm run test` | Tests con Jest |
| `npm run test:watch` | Jest en modo watch |
| `npm run test:coverage` | Cobertura de tests |
