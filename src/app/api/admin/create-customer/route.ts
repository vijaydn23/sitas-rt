// src/app/api/admin/create-customer/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { name, code, ownerEmail } = await req.json();
    if (!name || !ownerEmail) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const owner = await db.user.findUnique({ where: { email: ownerEmail } });
    if (!owner) return NextResponse.json({ error: 'Owner user not found' }, { status: 404 });

    await db.customer.create({
      data: { name, code: code || null, ownerId: owner.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
