/**
 * Edge Runtime uchun auth moduli.
 * node:crypto ishlatib bo'lmaydi — Web Crypto API (SubtleCrypto) ishlatiladi.
 * Bu fayl faqat proxy.ts (Edge Middleware) tomonidan import qilinadi.
 */
import { z } from 'zod';
import type { User } from '@/types';

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

const encoder = new TextEncoder();

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', encoder.encode(value));
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

  return {
    id: account.username,
    name: account.name,
    role: account.role,
    title: account.role,
    organization: account.organization,
  };
}
