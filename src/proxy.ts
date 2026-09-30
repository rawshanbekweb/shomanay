import { NextRequest, NextResponse } from 'next/server';
import { authenticateEdge, HttpError } from '@/lib/edge-auth';

export async function proxy(request: NextRequest) {
  try {
    await authenticateEdge(request);
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 503;
    return NextResponse.json(
      { error: status === 401 ? 'Kirish talab qilinadi.' : 'Kirish sozlamalarini tekshiring.' },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
          ...(status === 401 ? { 'WWW-Authenticate': 'Basic realm="Shomanay", charset="UTF-8"' } : {}),
        },
      }
    );
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
