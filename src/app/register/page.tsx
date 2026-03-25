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

const registerSchema = z.object({
  name: z.string({ error: 'Name is required' }).min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  email: z.string({ error: 'Email is required' }).email('Please enter a valid email address'),
  password: z.string({ error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(registerSchema),
    onSubmit: async (values) => {
      setError('');
      const ok = await register(values.email, values.password, values.name, 'user');
      if (!ok) setError('An account with this email already exists.');
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
            Join the community<br />of shader creators.
          </p>
          <p className="text-muted-foreground text-sm">
            Upload your shaders, get feedback, and inspire others with your work.
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
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-muted-foreground">Already have one?{' '}
              <Link href="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-widest">Display name</label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                className="h-10"
                onChange={formik.handleChange}
                value={formik.values.name}
              />
              {formik.errors.name && formik.touched.name && (
                <p className="text-xs text-destructive">{formik.errors.name}</p>
              )}
            </div>

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
                autoComplete="new-password"
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
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
