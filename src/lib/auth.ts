import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
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

export const SESSION_COOKIE = 'sh_session';

function accounts() {
  const config = accountSchema.safeParse((() => {
    try { return JSON.parse(process.env.AUTH_USERS || 'null'); } catch { return null; }
  })());
  if (!config.success || new Set(config.data.map(u => u.username)).size !== config.data.length) {
    throw new HttpError(503, 'Serverda foydalanuvchi hisoblari sozlanmagan.');
  }
  return config.data;
}

// SESSION_SECRET berilmasa, kalit AUTH_USERS dan hosil qilinadi (edge-auth.ts bilan bir xil).
export function sessionSecret() {
  return process.env.SESSION_SECRET || createHash('sha256').update(`shomanay-session:${process.env.AUTH_USERS || ''}`).digest('hex');
}

function toUser(account: z.infer<typeof accountSchema>[number]): User {
  return { id: account.username, name: account.name, role: account.role, title: account.role, organization: account.organization };
}

function readCookie(request: Request, name: string) {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

// Login sahifasi bergan HMAC imzoli sessiya tokenini tekshiradi. Rol va tashkilot har safar
// joriy AUTH_USERS dan olinadi, shuning uchun o‘chirilgan hisobning tokeni ishlamaydi.
function sessionUser(request: Request, list: ReturnType<typeof accounts>): User | null {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const payload = decodeURIComponent(token.slice(0, dot));
  const signature = Buffer.from(decodeURIComponent(token.slice(dot + 1)), 'base64');
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest();
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as { id?: string; exp?: number };
    if (typeof data.exp !== 'number' || Date.now() > data.exp) return null;
    const account = list.find(user => user.username === data.id);
    return account ? toUser(account) : null;
  } catch { return null; }
}

export function authenticate(request: Request): User {
  const list = accounts();
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Basic ')) {
    const user = sessionUser(request, list);
    if (user) return user;
    throw new HttpError(401, 'Kirish talab qilinadi.');
  }
  const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  const account = list.find(user => user.username === username);
  const hash = (value: string) => createHash('sha256').update(value).digest();
  const matches = timingSafeEqual(hash(password), hash(account?.password || 'invalid-account'));
  if (separator < 0 || !account || !matches) throw new HttpError(401, 'Login yoki parol noto‘g‘ri.');
  return toUser(account);
}

export function authorize(request: Request, roles?: User['role'][]): User {
  const user = authenticate(request);
  if (roles && !roles.includes(user.role)) throw new HttpError(403, 'Bu amal uchun ruxsat yo‘q.');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
    if ((origin && origin !== expected) || request.headers.get('sec-fetch-site') === 'cross-site') {
      throw new HttpError(403, 'So‘rov manbasiga ruxsat yo‘q.');
    }
    if (!request.headers.get('content-type')?.startsWith('application/json')) {
      throw new HttpError(415, 'JSON so‘rov talab qilinadi.');
    }
  }
  return user;
}
