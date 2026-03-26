'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthFromTokens } = useAuthStore();

  useEffect(() => {
    const authenticateAndRedirect = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');

      if (!token || !refreshToken) {
        router.push('/login');
        return;
      }

      const success = await setAuthFromTokens(token, refreshToken);

      if (success) {
        router.push('/');
      } else {
        router.push('/login');
      }
    };

    authenticateAndRedirect();
  }, [searchParams, setAuthFromTokens, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Signing you in...</h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we complete your authentication.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
