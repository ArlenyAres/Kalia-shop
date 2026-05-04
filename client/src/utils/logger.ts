const isDev = import.meta.env.DEV;
const ts = () => new Date().toTimeString().slice(0, 8);

const logger = {
  info(msg: string, meta?: object) {
    if (isDev) console.log(`[KALIA ${ts()}] INFO:`, msg, meta ?? '');
  },
  warn(msg: string, meta?: object) {
    if (isDev) console.warn(`[KALIA ${ts()}] WARN:`, msg, meta ?? '');
  },
  error(msg: string, error?: unknown) {
    if (isDev) {
      console.error(`[KALIA ${ts()}] ERROR:`, msg, error ?? '');
    } else {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg, error: String(error), ts: Date.now() }),
      }).catch(() => undefined);
    }
  },
};

export default logger;
