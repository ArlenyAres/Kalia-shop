import { ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from './Button';
import './CartDrawer.css';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal, itemCount } =
    useCart();

  if (!isDrawerOpen) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);

  return (
    <>
      <div
        className="cart-drawer__overlay"
        onClick={closeDrawer}
        role="presentation"
        aria-hidden="true"
      />
      <aside
        className="cart-drawer__panel"
        aria-label="Carrito de compras"
        role="dialog"
        aria-modal="true"
      >
        <div className="cart-drawer__header">
          <div>
            <h2>Tu carrito</h2>
            {itemCount > 0 && (
              <span className="cart-drawer__count">
                {itemCount} {itemCount === 1 ? 'pieza' : 'piezas'}
              </span>
            )}
          </div>
          <button
            className="cart-drawer__close"
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <ShoppingBag size={40} strokeWidth={1} />
            <p>Tu carrito está vacío</p>
            <Button variant="secondary" size="sm" onClick={closeDrawer}>
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__items" aria-label="Artículos en el carrito">
              {items.map((item) => (
                <li key={item.sku} className="cart-item">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="cart-item__image"
                    loading="lazy"
                  />
                  <div className="cart-item__body">
                    <p className="cart-item__name">{item.productName}</p>
                    <p className="cart-item__meta">
                      {item.size} · {item.color}
                    </p>
                    <p className="cart-item__price">{fmt(item.price)}</p>
                    <div className="cart-item__actions">
                      <div className="cart-item__qty" role="group" aria-label="Cantidad">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeItem(item.sku)}
                        aria-label={`Eliminar ${item.productName}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <strong>{fmt(subtotal)}</strong>
              </div>
              <Link to="/checkout" onClick={closeDrawer}>
                <Button variant="cta" size="lg" className="cart-drawer__cta">
                  Finalizar compra
                </Button>
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
