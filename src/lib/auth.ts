import { createHash, timingSafeEqual } from 'node:crypto';
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

export function authenticate(request: Request): User {
  const config = accountSchema.safeParse((() => {
    try { return JSON.parse(process.env.AUTH_USERS || 'null'); } catch { return null; }
  })());
  if (!config.success || new Set(config.data.map(u => u.username)).size !== config.data.length) {
    throw new HttpError(503, 'Serverda foydalanuvchi hisoblari sozlanmagan.');
  }
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Basic ')) throw new HttpError(401, 'Kirish talab qilinadi.');
  const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  const account = config.data.find(user => user.username === username);
  const hash = (value: string) => createHash('sha256').update(value).digest();
  const matches = timingSafeEqual(hash(password), hash(account?.password || 'invalid-account'));
  if (separator < 0 || !account || !matches) throw new HttpError(401, 'Login yoki parol noto‘g‘ri.');
  return { id: account.username, name: account.name, role: account.role, title: account.role, organization: account.organization };
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
