import { CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { getLastOrder } from '../services/orders.service';
import './CheckoutPage.css';

export function ConfirmationPage() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  const { format } = useCurrency();
  const order = getLastOrder(orderNumber);

  return (
    <div className="checkout-page">
      <div className="container confirmation">
        <CheckCircle2 size={48} strokeWidth={1.25} />
        {order?.isDemo && <span className="confirmation__badge">Pedido de demostración · sin cargo</span>}
        <h1 className="section-title">¡Gracias por tu compra!</h1>
        <p className="text-muted">
          Tu número de pedido es <strong>{orderNumber}</strong>.
          {order && (
            <>
              {' '}
              Enviaremos la confirmación a <strong>{order.shippingAddress.email}</strong>.
            </>
          )}
        </p>

        {order && (
          <section className="checkout-summary" aria-label="Detalle del pedido">
            <h2>Detalle</h2>
            <ul>
              {order.items.map((item) => (
                <li key={item.sku} className="checkout-summary__item">
                  <img src={item.imageUrl} alt="" />
                  <div>
                    <p className="checkout-summary__name">{item.productName}</p>
                    <p className="text-muted">
                      {item.size} · {item.color} · x{item.quantity}
                    </p>
                  </div>
                  <span>{format(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="checkout-summary__totals">
              <div>
                <dt>Envío a</dt>
                <dd>
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </dd>
              </div>
              <div className="checkout-summary__total">
                <dt>Total</dt>
                <dd>{format(order.total)}</dd>
              </div>
            </dl>
          </section>
        )}

        <Link className="btn btn-primary" to="/collection">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
