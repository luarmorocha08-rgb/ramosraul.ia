
/**
 * Rate limiting em memória (janela deslizante).
 *
 * Funciona por instância do servidor. Em ambientes serverless com várias
 * instâncias, troque o `store` por um backend compartilhado (Upstash Redis,
 * tabela no Supabase etc.) mantendo a mesma interface.
 */
interface Bucket {
  hits: number[];
}

const store = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.hits.length === 0 || now - bucket.hits[bucket.hits.length - 1]! > 86_400_000) store.delete(key);
  }
}

export interface LimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    store.set(key, bucket);
    return { ok: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)) };
  }
  bucket.hits.push(now);
  store.set(key, bucket);
  return { ok: true, remaining: limit - bucket.hits.length, retryAfterSec: 0 };
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
