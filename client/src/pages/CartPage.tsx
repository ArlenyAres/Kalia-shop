import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const navigate = useNavigate();
  const { openDrawer } = useCart();

  useEffect(() => {
    openDrawer();
    navigate('/', { replace: true });
  }, [navigate, openDrawer]);

  return null;
}
