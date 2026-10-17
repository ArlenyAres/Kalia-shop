import { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { AboutPage } from './pages/AboutPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CollectionPage } from './pages/CollectionPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';
import { clearSession, hasValidSession } from './services/session';

// El panel de administración se descarga solo cuando se visita: la tienda no paga su peso.
const named = <T extends string>(loader: () => Promise<Record<T, React.ComponentType>>, name: T) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

const AdminLoginPage = named(() => import('./pages/admin/AdminLoginPage'), 'AdminLoginPage');
const AdminLayout = named(() => import('./components/admin/AdminLayout'), 'AdminLayout');
const DashboardPage = named(() => import('./pages/admin/DashboardPage'), 'DashboardPage');
const AdminProductsPage = named(() => import('./pages/admin/AdminProductsPage'), 'AdminProductsPage');
const AdminOrdersPage = named(() => import('./pages/admin/AdminOrdersPage'), 'AdminOrdersPage');
const ProductForm = named(() => import('./components/admin/ProductForm'), 'ProductForm');

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="admin-loading" role="status">Cargando panel…</div>}>{children}</Suspense>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!hasValidSession()) {
    clearSession();
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'collection/:category?', element: <CollectionPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'confirmacion/:orderNumber', element: <ConfirmationPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <AdminSuspense>
        <AdminLoginPage />
      </AdminSuspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminSuspense>
          <AdminLayout />
        </AdminSuspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminSuspense><DashboardPage /></AdminSuspense> },
      { path: 'productos', element: <AdminSuspense><AdminProductsPage /></AdminSuspense> },
      { path: 'productos/nuevo', element: <AdminSuspense><ProductForm /></AdminSuspense> },
      { path: 'productos/:id', element: <AdminSuspense><ProductForm /></AdminSuspense> },
      { path: 'pedidos', element: <AdminSuspense><AdminOrdersPage /></AdminSuspense> },
    ],
  },
]);
