import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCart } from '../context/CartContext';
import api from '../services/api';

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

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setIsProcessing(true);
    try {
      const { data } = await api.post<{ orderNumber: string }>('/checkout', {
        items,
        shippingAddress: values,
        paymentMethod,
        subtotal,
        shippingCost: 0,
        total: subtotal,
        guestEmail: values.email,
      });
      clearCart();
      navigate(`/confirmacion/${data.orderNumber}`);
    } catch {
      toast.error('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      {isProcessing && (
        <div className="checkout-overlay" role="status" aria-label="Procesando pago">
          <span>Procesando...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="firstName">Nombre</label>
          <input id="firstName" {...register('firstName')} />
          {errors.firstName && <span role="alert">{errors.firstName.message}</span>}
        </div>

        <div>
          <label htmlFor="lastName">Apellido</label>
          <input id="lastName" {...register('lastName')} />
          {errors.lastName && <span role="alert">{errors.lastName.message}</span>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <span role="alert">{errors.email.message}</span>}
        </div>

        <div>
          <label htmlFor="street">Dirección</label>
          <input id="street" {...register('street')} />
          {errors.street && <span role="alert">{errors.street.message}</span>}
        </div>

        <div>
          <label htmlFor="city">Ciudad</label>
          <input id="city" {...register('city')} />
          {errors.city && <span role="alert">{errors.city.message}</span>}
        </div>

        <div>
          <label htmlFor="state">Estado / Provincia</label>
          <input id="state" {...register('state')} />
          {errors.state && <span role="alert">{errors.state.message}</span>}
        </div>

        <div>
          <label htmlFor="zip">Código postal</label>
          <input id="zip" {...register('zip')} />
          {errors.zip && <span role="alert">{errors.zip.message}</span>}
        </div>

        <div>
          <label htmlFor="country">País</label>
          <input id="country" {...register('country')} />
          {errors.country && <span role="alert">{errors.country.message}</span>}
        </div>

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
            Tarjeta
          </button>
        </div>

        {paymentMethod === 'paypal' && (
          <section aria-label="Pago con PayPal" className="checkout-paypal">
            <p>Serás redirigido a PayPal para completar el pago.</p>
          </section>
        )}

        {paymentMethod === 'card' && (
          <section aria-label="Pago con tarjeta" className="checkout-card">
            <p>Introduce los datos de tu tarjeta.</p>
          </section>
        )}

        <button type="submit">Confirmar pedido</button>
      </form>
    </div>
  );
}
