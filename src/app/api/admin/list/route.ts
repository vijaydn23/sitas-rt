// src/app/api/admin/list/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  const customers = await db.customer.findMany({
    select: { id: true, name: true, code: true, owner: { select: { email: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ users, customers });
}
