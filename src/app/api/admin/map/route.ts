// src/app/api/admin/map/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { inchargeEmail, customerId } = await req.json();
    if (!inchargeEmail || !customerId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const incharge = await db.user.findUnique({ where: { email: inchargeEmail } });
    if (!incharge || incharge.role !== 'INCHARGE')
      return NextResponse.json({ error: 'Incharge user not found' }, { status: 404 });

    await db.inchargeCustomer.create({
      data: { inchargeId: incharge.id, customerId },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Already mapped' }, { status: 400 });
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
