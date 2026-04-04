import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // The Caprover domains directory is mounted at /captain-domains
  const path = `/captain-domains/${host}/.well-known/captain-identifier`;

  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8').trim();
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Not Found', { status: 404 });
}
