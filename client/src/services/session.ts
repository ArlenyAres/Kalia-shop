const TOKEN_KEY = 'kalia_token';
const ADMIN_NAME_KEY = 'kalia_admin';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSession(token: string, adminName: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_NAME_KEY, adminName);
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_NAME_KEY);
  } catch {
    // nada que limpiar
  }
}

/**
 * Comprobación local de caducidad para no mostrar el panel con un token vencido.
 * La validación real (firma) la hace siempre el servidor.
 */
export function hasValidSession(now = Date.now()): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return typeof payload.exp !== 'number' || payload.exp * 1000 > now;
  } catch {
    return false;
  }
}
