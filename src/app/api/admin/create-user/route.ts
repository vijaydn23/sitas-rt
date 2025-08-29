// src/app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { email, name, password, role } = await req.json();
    if (!email || !password || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.create({ data: { email, name: name || null, passwordHash, role } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
