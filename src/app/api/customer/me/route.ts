import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { customer: true },
  });
  const row = me?.customer ? { name: me.customer.name, code: me.customer.code } : null;
  return NextResponse.json({ row });
}
