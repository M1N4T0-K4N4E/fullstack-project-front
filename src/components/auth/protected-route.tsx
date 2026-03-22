'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'organizer') {
        router.push('/dashboard/organizer');
      } else {
        router.push('/dashboard/user');
      }
    }
  }, [isAuthenticated, user, pathname, redirectTo, allowedRoles, router, hasHydrated]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
