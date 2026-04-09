'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';
import { Globe } from 'lucide-react';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(loginSchema),
    onSubmit: async (values) => {
      setError('');
      const ok = await login(values.email, values.password);
      if (!ok) setError('Invalid email or password.');
    },
  });

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col p-12 justify-between">
        <Link href="/">
          <img className="h-8" src="/logo-long.svg" alt="shaderd" />
        </Link>
        <div className="space-y-3">
          <p className="text-3xl font-bold leading-snug">
            The community<br />for shader creators.
          </p>
          <p className="text-muted-foreground text-sm">
            Discover, share, and remix shaders built by developers around the world.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 shaderd</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <Link href="/" className="lg:hidden block">
            <img className="h-8" src="/logo-long.svg" alt="shaderd" />
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground">New here?{' '}
              <Link href="/register" className="text-foreground underline underline-offset-4">Create an account</Link>
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-widest">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-10"
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-xs text-destructive">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-widest">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-10"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {formik.errors.password && formik.touched.password && (
                <p className="text-xs text-destructive">{formik.errors.password}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive pt-1">{error}</p>
            )}

            <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
              globalThis.location.href = apiBaseUrl ? `${apiBaseUrl}/api/auth/google` : '/api/auth/google';
            }}
            className="space-y-3"
          >
            <Button type="submit" variant="outline" className="w-full h-10">
              <Globe className="w-4 h-4 mr-2" />
              Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
