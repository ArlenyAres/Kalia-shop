import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ordersService } from '../services/orders.service';
import './CheckoutPage.css';

const schema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  street: z.string().min(1, 'Requerido'),
  city: z.string().min(1, 'Requerido'),
  state: z.string().min(1, 'Requerido'),
  zip: z.string().min(1, 'Requerido'),
  country: z.string().min(1, 'Requerido'),
});

type FormValues = z.infer<typeof schema>;

const FIELDS: Array<{ name: keyof FormValues; label: string; type?: string; autoComplete: string; wide?: boolean }> = [
  { name: 'firstName', label: 'Nombre', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Apellido', autoComplete: 'family-name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', wide: true },
  { name: 'street', label: 'Dirección', autoComplete: 'street-address', wide: true },
  { name: 'city', label: 'Ciudad', autoComplete: 'address-level2' },
  { name: 'state', label: 'Estado / Provincia', autoComplete: 'address-level1' },
  { name: 'zip', label: 'Código postal', autoComplete: 'postal-code' },
  { name: 'country', label: 'País', autoComplete: 'country-name' },
];

const SHIPPING_COST = 0;

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const total = subtotal + SHIPPING_COST;

  const onSubmit = async (values: FormValues) => {
    setIsProcessing(true);
    try {
      const order = await ordersService.checkout({
        items,
        shippingAddress: values,
        paymentMethod,
        subtotal,
        shippingCost: SHIPPING_COST,
        total,
      });
      clearCart();
      navigate(`/confirmacion/${order.orderNumber}`);
    } catch {
      toast.error('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container checkout-empty">
          <ShoppingBag size={40} strokeWidth={1} />
          <h1 className="section-title">Tu carrito está vacío</h1>
          <p className="text-muted">Añade alguna pieza antes de finalizar la compra.</p>
          <Link className="btn btn-primary" to="/collection">
            Ver colección
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {isProcessing && (
        <div className="checkout-overlay" role="status" aria-label="Procesando pago">
          <span>Procesando...</span>
        </div>
      )}

      <div className="container">
        <span className="eyebrow">Checkout</span>
        <h1 className="section-title">Finalizar compra</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <fieldset className="checkout-fieldset">
              <legend>Datos de envío</legend>
              <div className="checkout-grid">
                {FIELDS.map((f) => (
                  <div key={f.name} className={`checkout-field${f.wide ? ' checkout-field--wide' : ''}`}>
                    <label htmlFor={f.name}>{f.label}</label>
                    <input
                      id={f.name}
                      type={f.type ?? 'text'}
                      autoComplete={f.autoComplete}
                      aria-invalid={errors[f.name] ? true : undefined}
                      {...register(f.name)}
                    />
                    {errors[f.name] && <span role="alert">{errors[f.name]?.message}</span>}
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="checkout-fieldset">
              <legend>Método de pago</legend>
              <div className="checkout-payment-tabs">
                <button
                  type="button"
                  aria-pressed={paymentMethod === 'paypal'}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  PayPal
                </button>
                <button
                  type="button"
                  aria-pressed={paymentMethod === 'card'}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={16} /> Tarjeta
                </button>
              </div>

              {paymentMethod === 'paypal' && (
                <section aria-label="Pago con PayPal" className="checkout-payment-info">
                  <p>Serás redirigido a PayPal para completar el pago.</p>
                </section>
              )}

              {paymentMethod === 'card' && (
                <section aria-label="Pago con tarjeta" className="checkout-payment-info">
                  <p>Introduce los datos de tu tarjeta en el siguiente paso.</p>
                </section>
              )}
            </fieldset>

            <button type="submit" className="btn btn-primary checkout-submit" disabled={isProcessing}>
              <Lock size={16} /> Confirmar pedido · {format(total)}
            </button>
          </form>

          <aside className="checkout-summary" aria-label="Resumen del pedido">
            <h2>Resumen</h2>
            <ul>
              {items.map((item) => (
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
                <dt>Subtotal</dt>
                <dd>{format(subtotal)}</dd>
              </div>
              <div>
                <dt>Envío</dt>
                <dd>{SHIPPING_COST === 0 ? 'Gratis' : format(SHIPPING_COST)}</dd>
              </div>
              <div className="checkout-summary__total">
                <dt>Total</dt>
                <dd>{format(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
