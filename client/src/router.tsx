import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { AboutPage } from './pages/AboutPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CollectionPage } from './pages/CollectionPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProductForm } from './components/admin/ProductForm';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('kalia_token');
  if (!token) return <Navigate to="/admin/login" replace />;
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
      { path: 'about', element: <AboutPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'productos', element: <AdminProductsPage /> },
      { path: 'productos/nuevo', element: <ProductForm /> },
      { path: 'productos/:id', element: <ProductForm /> },
      { path: 'pedidos', element: <AdminOrdersPage /> },
    ],
  },
]);
