/**
 * Edge Runtime uchun auth moduli.
 * Web Crypto API (SubtleCrypto) ishlatiladi — node:crypto emas.
 * Proxy (Edge Middleware) va session boshqaruvi tomonidan ishlatiladi.
 */
import { z } from 'zod';
import type { User } from '@/types';

export const SESSION_COOKIE = 'sh_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 soat

const accountSchema = z.array(z.object({
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(16),
  role: z.enum(['hokim', 'coordinator', 'organization', 'inspector', 'statistician', 'admin']),
  name: z.string().min(1),
  organization: z.string().min(1),
})).min(1);

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const enc = new TextEncoder();
const dec = new TextDecoder();

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-prod';
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
}

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', enc.encode(value));
}

function constantTimeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

function getAccounts() {
  const config = accountSchema.safeParse((() => {
    try { return JSON.parse(process.env.AUTH_USERS || 'null'); } catch { return null; }
  })());
  if (!config.success || new Set(config.data.map(u => u.username)).size !== config.data.length) {
    throw new HttpError(503, 'Serverda foydalanuvchi hisoblari sozlanmagan.');
  }
  return config.data;
}

// ── Session token (HMAC-signed) ─────────────────────────────────────────────

export async function createSessionToken(user: User): Promise<string> {
  const payload = JSON.stringify({ id: user.id, name: user.name, role: user.role, organization: user.organization, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const b64 = btoa(payload);
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(b64));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${b64}.${sigB64}`;
}

export async function verifySessionToken(token: string): Promise<User | null> {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 0) return null;
    const b64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);
    const key = await getHmacKey();
    const expectedSig = await crypto.subtle.sign('HMAC', key, enc.encode(b64));
    const actualSig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    if (!constantTimeEqual(expectedSig, actualSig.buffer)) return null;
    const payload = JSON.parse(dec.decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))));
    if (Date.now() > payload.exp) return null;
    return { id: payload.id, name: payload.name, role: payload.role, title: payload.role, organization: payload.organization };
  } catch { return null; }
}

// ── Basic Auth (API mijozlar uchun) ─────────────────────────────────────────

export async function authenticateEdge(request: Request): Promise<User> {
  const accounts = getAccounts();
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Basic ')) throw new HttpError(401, 'Kirish talab qilinadi.');

  const decoded = atob(authorization.slice(6));
  const separator = decoded.indexOf(':');
  if (separator < 0) throw new HttpError(401, 'Login yoki parol noto\'g\'ri.');

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  const account = accounts.find(u => u.username === username);

  const [hashInput, hashStored] = await Promise.all([
    sha256(password),
    sha256(account?.password ?? 'invalid-account-placeholder'),
  ]);

  if (!account || !constantTimeEqual(hashInput, hashStored)) {
    throw new HttpError(401, 'Login yoki parol noto\'g\'ri.');
  }

  return { id: account.username, name: account.name, role: account.role, title: account.role, organization: account.organization };
}

// ── Credentials tekshirish (login form uchun) ───────────────────────────────

export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  let accounts;
  try { accounts = getAccounts(); } catch { return null; }
  const account = accounts.find(u => u.username === username);
  const [hashInput, hashStored] = await Promise.all([
    sha256(password),
    sha256(account?.password ?? 'invalid-account-placeholder'),
  ]);
  if (!account || !constantTimeEqual(hashInput, hashStored)) return null;
  return { id: account.username, name: account.name, role: account.role, title: account.role, organization: account.organization };
}
