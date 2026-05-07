# Kalia

Tienda de ropa de baño de lujo — monorepo con storefront React y API REST en Node.js.


https://github.com/user-attachments/assets/96707ab3-69a1-4a1b-bd87-db222b6e80cb

https://github.com/user-attachments/assets/2d248413-7c35-4c4d-a7c9-d388d51f6b09





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

---

## Integración del SDK de PayPal

Kalia implementa pagos con PayPal usando la REST API de PayPal en el servidor y el paquete `@paypal/react-paypal-js` en el cliente.

### 1. Crear una app en PayPal Developer

1. Accede a [developer.paypal.com](https://developer.paypal.com) e inicia sesión.
2. Ve a **My Apps & Credentials**.
3. En la pestaña **Sandbox**, haz clic en **Create App** para desarrollo, o **Live** para producción.
4. Copia el **Client ID** y el **Client Secret** que se generan.

### 2. Variables de entorno necesarias

Añade las siguientes variables al archivo `server/.env`:

```env
PAYPAL_CLIENT_ID=<tu-client-id>
PAYPAL_CLIENT_SECRET=<tu-client-secret>
```

Y en el archivo `client/.env` (o `client/.env.local`):

```env
VITE_PAYPAL_CLIENT_ID=<tu-client-id>
```

> **Nota:** Para sandbox usa las credenciales de la pestaña *Sandbox*; para producción, las de *Live*. El servidor detecta el entorno automáticamente con `NODE_ENV=production`.

### 3. Configuración del servidor (`server/src/config/paypal.ts`)

El archivo ya incluye la configuración necesaria. Al arrancar en producción (`NODE_ENV=production`), apunta a `https://api-m.paypal.com`; en cualquier otro entorno, a `https://api-m.sandbox.paypal.com`.

```typescript
export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID ?? '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com',
};
```

### 4. Flujo de pago en el servidor (`server/src/services/payment.service.ts`)

El servicio `PaymentService` expone dos métodos:

| Método | Descripción |
|---|---|
| `createPayPalOrder(total)` | Crea una orden en PayPal y devuelve el `orderID` |
| `capturePayPalOrder(orderID)` | Captura el pago tras la aprobación del comprador |

**Flujo completo:**

```
Cliente → POST /api/checkout
  └─ PaymentService.createPayPalOrder(total)
       └─ Obtiene token OAuth → POST /v1/oauth2/token
       └─ Crea orden          → POST /v2/checkout/orders
       └─ Devuelve { orderID }

Cliente (PayPal Buttons) → aprueba el pago en el popup de PayPal

Cliente → POST /api/checkout/capture  (con el orderID)
  └─ PaymentService.capturePayPalOrder(orderID)
       └─ Captura el pago    → POST /v2/checkout/orders/{id}/capture
       └─ Devuelve { status: 'COMPLETED' }
```

### 5. Integración en el cliente React

El paquete `@paypal/react-paypal-js` (ya incluido en las dependencias) proporciona el provider y los botones listos para usar.

#### 5.1 Envolver la app con `PayPalScriptProvider`

En `client/src/main.tsx` o en el componente raíz del checkout:

```tsx
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

<PayPalScriptProvider
  options={{
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'USD',        // cambia a 'DOP' si usas pesos dominicanos
    intent: 'capture',
  }}
>
  <App />
</PayPalScriptProvider>
```

#### 5.2 Renderizar los botones de pago

```tsx
import { PayPalButtons } from '@paypal/react-paypal-js';

<PayPalButtons
  style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
  createOrder={async () => {
    // Llama al endpoint del servidor que invoca createPayPalOrder()
    const { data } = await api.post<{ orderID: string }>('/payments/paypal/create', {
      total: subtotal,
    });
    return data.orderID;
  }}
  onApprove={async (data) => {
    // Llama al endpoint del servidor que invoca capturePayPalOrder()
    await api.post('/payments/paypal/capture', { orderID: data.orderID });
    clearCart();
    navigate('/confirmacion');
  }}
  onError={(err) => {
    console.error('PayPal error', err);
    toast.error('Error al procesar el pago con PayPal');
  }}
/>
```

### 6. Probar en sandbox

1. En [developer.paypal.com](https://developer.paypal.com) → **Sandbox** → **Accounts**, crea una cuenta de comprador de prueba.
2. Usa esa cuenta para completar pagos en el entorno de desarrollo.
3. Verifica las transacciones en **Sandbox** → **Transactions**.

---

## Puesta en marcha en producción

Esta sección describe el proceso completo para desplegar Kalia en un servidor Linux (por ejemplo, una VPS en DigitalOcean, Render, Railway o similar) con una base de datos PostgreSQL gestionada.

### 1. Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 LTS |
| npm | 9+ |
| PostgreSQL | 15+ |
| Git | cualquiera |

### 2. Base de datos PostgreSQL en producción

#### Opción A — Base de datos gestionada (recomendado)

Usa un proveedor como **Supabase**, **Railway**, **Neon** o **DigitalOcean Managed Databases**. Todos ellos te proporcionan una cadena de conexión lista para usar del tipo:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

#### Opción B — PostgreSQL en el propio servidor

```bash
# Instalar PostgreSQL
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres psql <<'SQL'
CREATE USER kalia_user WITH PASSWORD 'contraseña_segura';
CREATE DATABASE kalia_db OWNER kalia_user;
GRANT ALL PRIVILEGES ON DATABASE kalia_db TO kalia_user;
SQL
```

La cadena de conexión quedaría:

```
DATABASE_URL="postgresql://kalia_user:contraseña_segura@localhost:5432/kalia_db"
```

### 3. Clonar el repositorio y preparar el servidor

```bash
git clone https://github.com/ArlenyAres/Kalia-shop.git
cd Kalia-shop

# Instalar dependencias del servidor
cd server && npm install --omit=dev
```

### 4. Variables de entorno en producción

Crea el archivo `server/.env` con todos los valores reales:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://kalia_user:contraseña_segura@HOST:5432/kalia_db?sslmode=require"
JWT_SECRET="cadena-aleatoria-larga-y-secreta"
CLIENT_URL="https://tu-dominio.com"

PAYPAL_CLIENT_ID="tu-client-id-live"
PAYPAL_CLIENT_SECRET="tu-client-secret-live"

STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

CLOUDINARY_CLOUD_NAME="tu-cloud"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

SMTP_HOST="smtp.tuproveedor.com"
SMTP_USER="correo@tudominio.com"
SMTP_PASS="contraseña-smtp"
```

> **Seguridad:** Nunca subas este archivo a Git. Está incluido en `.gitignore`.

### 5. Ejecutar migraciones y seed en producción

```bash
cd server

# Genera el cliente Prisma apuntando al esquema del monorepo
npm run prisma:generate

# Aplica las migraciones en la base de datos de producción
npx prisma migrate deploy --schema ../prisma/schema.prisma

# (Opcional) Carga productos de ejemplo
npm run prisma:seed
```

> `migrate deploy` aplica solo las migraciones pendientes sin modificar el esquema, siendo seguro para producción.

### 6. Crear el primer usuario administrador

```bash
cd server
node -e "
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const hash = await bcrypt.hash('TU_CONTRASEÑA_SEGURA', 12);
  const user = await prisma.adminUser.create({
    data: { email: 'admin@tu-dominio.com', password: hash, name: 'Admin' }
  });
  console.log('Usuario admin creado:', user.email);
} catch (err) {
  console.error('Error al crear el usuario admin:', err);
  process.exitCode = 1;
} finally {
  await prisma.\$disconnect();
}
" --input-type=module
```

### 7. Build y arranque del servidor

```bash
cd server

# Compilar TypeScript a JavaScript
npm run build

# Arrancar en producción
npm run start
```

Para mantener el proceso activo, usa un gestor de procesos:

```bash
# Con PM2
npm install -g pm2
pm2 start dist/app.js --name kalia-server
pm2 save
pm2 startup   # configura el arranque automático con el sistema
```

### 8. Build y despliegue del cliente

```bash
cd client

# Crear el archivo de variables de entorno de producción
cat > .env.production <<'EOF'
VITE_API_URL=https://api.tu-dominio.com/api
VITE_PAYPAL_CLIENT_ID=tu-client-id-live
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
EOF

# Construir los estáticos
npm run build
# Los archivos quedan en client/dist/
```

Sirve la carpeta `dist/` con **Nginx**, **Caddy**, o súbela directamente a un CDN/hosting estático (Vercel, Netlify, Cloudflare Pages).

#### Ejemplo de configuración Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Cliente (SPA)
    root /var/www/kalia/client/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al servidor API
    location /api/ {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Obtén certificado SSL gratuito con Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 9. Lista de verificación final

- [ ] `DATABASE_URL` apunta a la base de datos de producción
- [ ] `NODE_ENV=production` está configurado
- [ ] `JWT_SECRET` es una cadena aleatoria segura (mínimo 32 caracteres)
- [ ] Credenciales de PayPal son las de **Live** (no Sandbox)
- [ ] SSL activado en el dominio
- [ ] PM2 (u otro gestor) mantiene el servidor activo
- [ ] Webhooks de Stripe apuntan a `https://api.tu-dominio.com/api/webhooks/stripe`
- [ ] Backups automáticos de la base de datos configurados
