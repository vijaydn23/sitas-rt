'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export type AppRole = 'ADMIN' | 'INCHARGE' | 'CUSTOMER';
type AllowedRole = AppRole | Lowercase<AppRole>;

function toAppRole(val?: string | null): AppRole | null {
  if (!val) return null;
  const u = val.toUpperCase();
  if (u === 'ADMIN' || u === 'INCHARGE' || u === 'CUSTOMER') return u as AppRole;
  return null;
}

export default function RoleGate({
  allow,
  children,
  fallback,
}: {
  allow?: AllowedRole[];          // accepts 'ADMIN' or 'admin'
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  const roleFromSession = (session?.user as any)?.role as string | undefined;
  const myRole = toAppRole(roleFromSession);

  // if not provided, allow everyone who has a valid role
  const allowedNormalized: AppRole[] =
    (allow && allow.length > 0
      ? allow.map(r => toAppRole(String(r))!).filter(Boolean) as AppRole[]
      : (['ADMIN', 'INCHARGE', 'CUSTOMER'] as AppRole[]));

  if (!myRole || !allowedNormalized.includes(myRole)) {
    return <>{fallback ?? <div className="p-3 border rounded">Not authorized.</div>}</>;
  }

  return <>{children}</>;
}
