// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/sign-in');

  const role = (session.user as any).role as 'ADMIN' | 'INCHARGE' | 'CUSTOMER';
  if (role === 'ADMIN') redirect('/admin');
  if (role === 'INCHARGE') redirect('/entry');
  if (role === 'CUSTOMER') redirect('/reports');

  return null;
}
