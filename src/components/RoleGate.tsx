// src/components/RoleGate.tsx
'use client';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export type AppRole = 'ADMIN' | 'INCHARGE' | 'CUSTOMER';
export default function RoleGate({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { data } = useSession();
  const role = (data?.user as any)?.role as AppRole | undefined;

  if (!role) return <div className="p-6">Please sign in.</div>;
  if (!allow.includes(role)) return <div className="p-6">No access for role: {role}</div>;
  return <>{children}</>;
}
