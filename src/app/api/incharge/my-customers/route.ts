import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'INCHARGE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const me = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!me) return NextResponse.json({ rows: [] });
  const maps = await prisma.inchargeCustomer.findMany({
    where: { inchargeId: me.id },
    include: { customer: true },
    orderBy: { customer: { name: 'asc' } },
  });
  const rows = maps.map(m => ({ id: m.customer.id, name: m.customer.name, code: m.customer.code }));
  return NextResponse.json({ rows });
}
