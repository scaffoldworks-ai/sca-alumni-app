import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuth } from '@/lib/auth';

/** Only approved members get past this. Everyone else goes back to the front door. */
export function Gate({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { loading, user, member, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || !member || member.status !== 'approved') return <Redirect href="/" />;
  if (admin && !isAdmin) return <Redirect href="/home" />;
  return <>{children}</>;
}
