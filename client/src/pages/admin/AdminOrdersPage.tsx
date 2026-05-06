import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Save } from 'lucide-react';
import {
  getOrders,
  updateOrderStatus,
  updateTracking,
} from '../../services/admin.service';
import type { Order, OrderStatus } from '../../types/order.types';
import './AdminOrdersPage.css';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'payment_processing', label: 'Procesando pago' },
  { value: 'payment_failed', label: 'Pago fallido' },
  { value: 'paid', label: 'Pagado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded', label: 'Reembolsado' },
];

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

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingValues, setTrackingValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    getOrders()
      .then((data) => {
        setOrders(data);
        const tv: Record<string, string> = {};
        data.forEach((o) => {
          tv[o.id] = o.trackingNumber ?? '';
        });
        setTrackingValues(tv);
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast('Estado actualizado', 'success');
    } catch {
      showToast('Error al actualizar el estado', 'error');
    }
  };

  const handleTrackingSave = async (orderId: string) => {
    try {
      const updated = await updateTracking(orderId, trackingValues[orderId] ?? '');
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast('Tracking guardado', 'success');
    } catch {
      showToast('Error al guardar el tracking', 'error');
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-orders">
      <h1 className="admin-orders__title">Pedidos</h1>

      <div className="admin-orders__filters">
        <select
          className="admin-orders__filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          className="admin-orders__search"
          placeholder="Buscar por número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-orders__table-wrap">
        {loading ? (
          <p className="admin-orders__empty">Cargando pedidos...</p>
        ) : filtered.length === 0 ? (
          <p className="admin-orders__empty">No hay pedidos que coincidan.</p>
        ) : (
          <table className="admin-orders__table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Tracking</th>
                <th>Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <>
                  <tr key={order.id}>
                    <td className="admin-orders__order-num">{order.orderNumber}</td>
                    <td className="admin-orders__date">{formatDate(order.createdAt)}</td>
                    <td className="admin-orders__client">
                      {order.guestEmail ?? order.userId ?? '—'}
                    </td>
                    <td>{order.items.length}</td>
                    <td className="admin-orders__total">{formatPrice(order.total)}</td>
                    <td>
                      <select
                        className="admin-orders__status-select"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order, e.target.value as OrderStatus)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-orders__tracking-cell">
                        <input
                          className="admin-orders__tracking-input"
                          placeholder="Número de tracking"
                          value={trackingValues[order.id] ?? ''}
                          onChange={(e) =>
                            setTrackingValues((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTrackingSave(order.id);
                          }}
                        />
                        <button
                          className="admin-orders__tracking-save"
                          title="Guardar tracking"
                          type="button"
                          onClick={() => handleTrackingSave(order.id)}
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="admin-orders__expand-btn"
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === order.id ? null : order.id)
                        }
                        title={expandedId === order.id ? 'Colapsar' : 'Expandir'}
                      >
                        {expandedId === order.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`} className="admin-orders__detail-row">
                      <td colSpan={8}>
                        <div className="admin-orders__detail">
                          <div>
                            <div className="admin-orders__detail-title">Artículos</div>
                            <ul className="admin-orders__item-list">
                              {order.items.map((item) => (
                                <li key={item.id} className="admin-orders__item">
                                  <img
                                    className="admin-orders__item-img"
                                    src={item.imageUrl}
                                    alt={item.productName}
                                  />
                                  <div className="admin-orders__item-info">
                                    <div className="admin-orders__item-name">
                                      {item.productName}
                                    </div>
                                    <div className="admin-orders__item-meta">
                                      {item.size} · {item.color} · ×{item.quantity}
                                    </div>
                                  </div>
                                  <span className="admin-orders__item-price">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="admin-orders__detail-title">Envío</div>
                            <div className="admin-orders__address">
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              <br />
                              {order.shippingAddress.street}
                              <br />
                              {order.shippingAddress.zip} {order.shippingAddress.city},{' '}
                              {order.shippingAddress.state}
                              <br />
                              {order.shippingAddress.country}
                              <br />
                              {order.shippingAddress.email}
                            </div>
                            <span className="admin-orders__payment-badge">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className={`admin-orders__toast admin-orders__toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
