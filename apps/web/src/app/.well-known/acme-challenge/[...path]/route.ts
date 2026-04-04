import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const filename = path.join('/');

  // Prevent path traversal
  if (filename.includes('..')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const filePath = `/captain-domains/${host}/.well-known/acme-challenge/${filename}`;

  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8').trim();
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}
