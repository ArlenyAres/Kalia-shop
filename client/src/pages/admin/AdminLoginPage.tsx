import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminLoginPage.css';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type FormValues = z.infer<typeof schema>;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const { data } = await api.post<{ token: string; admin: { name: string } }>(
        '/admin/auth/login',
        values,
      );
      localStorage.setItem('kalia_token', data.token);
      localStorage.setItem('kalia_admin', data.admin.name);
      navigate('/admin');
    } catch {
      setServerError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <span className="admin-login__logo">KALIA</span>
        <p className="admin-login__subtitle">Panel de administración</p>

        <form className="admin-login__form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="admin-login__field">
            <label className="admin-login__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`admin-login__input${errors.email ? ' admin-login__input--error' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <span className="admin-login__field-error" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="admin-login__field">
            <label className="admin-login__label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`admin-login__input${errors.password ? ' admin-login__input--error' : ''}`}
              {...register('password')}
            />
            {errors.password && (
              <span className="admin-login__field-error" role="alert">
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && <p className="admin-login__error">{serverError}</p>}

          <button type="submit" className="admin-login__submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="admin-login__spinner" /> : null}
            {isSubmitting ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}
