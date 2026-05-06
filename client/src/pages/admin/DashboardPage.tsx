import { useEffect, useState } from 'react';
import { AlertTriangle, Package, ShoppingBag } from 'lucide-react';
import { getDashboard, type DashboardData } from '../../services/admin.service';
import type { OrderStatus } from '../../types/order.types';
import './DashboardPage.css';

function statusBadgeClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'pending',
    payment_processing: 'pending',
    payment_failed: 'cancelled',
    paid: 'paid',
    preparing: 'preparing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'refunded',
  };
  return `dashboard__badge dashboard__badge--${map[status] ?? 'pending'}`;
}

function statusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    payment_processing: 'Procesando',
    payment_failed: 'Pago fallido',
    paid: 'Pagado',
    preparing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };
  return map[status] ?? status;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="dashboard__loading">Cargando...</div>;
  }

  if (!data) return null;

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>

      {/* KPI cards */}
      <div className="dashboard__kpi-row">
        <div className="dashboard__kpi-card">
          <Package size={22} className="dashboard__kpi-icon" />
          <span className="dashboard__kpi-number">{data.totalProducts}</span>
          <span className="dashboard__kpi-label">Productos activos</span>
        </div>

        <div className="dashboard__kpi-card">
          <ShoppingBag size={22} className="dashboard__kpi-icon" />
          <span className="dashboard__kpi-number">{data.totalOrders}</span>
          <span className="dashboard__kpi-label">Pedidos totales</span>
        </div>

        <div className="dashboard__kpi-card">
          <AlertTriangle
            size={22}
            className={`dashboard__kpi-icon${data.lowStock.length > 0 ? ' dashboard__kpi-icon--amber' : ''}`}
          />
          <span className="dashboard__kpi-number">{data.lowStock.length}</span>
          <span className="dashboard__kpi-label">Stock crítico</span>
        </div>
      </div>

      {/* Recent orders */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <ShoppingBag size={18} />
          <h2 className="dashboard__section-title">Pedidos recientes</h2>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="dashboard__empty">No hay pedidos recientes.</p>
        ) : (
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <span className={statusBadgeClass(order.status)}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td>{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Low stock */}
      {data.lowStock.length > 0 && (
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <AlertTriangle size={18} style={{ color: 'var(--kalia-amber)' }} />
            <h2 className="dashboard__section-title">Stock crítico</h2>
          </div>

          <ul className="dashboard__low-stock-list">
            {data.lowStock.map((item, i) => (
              <li key={i} className="dashboard__low-stock-item">
                <div>
                  <div className="dashboard__low-stock-name">{item.productName}</div>
                  <div className="dashboard__low-stock-variant">
                    {item.size} · {item.colorName}
                  </div>
                </div>
                <span
                  className={`dashboard__low-stock-qty${
                    item.quantity <= 1
                      ? ' dashboard__low-stock-qty--critical'
                      : item.quantity <= 3
                        ? ' dashboard__low-stock-qty--warning'
                        : ''
                  }`}
                >
                  {item.quantity} uds.
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
