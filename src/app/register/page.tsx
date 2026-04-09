'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod/v4';
import zxcvbn from 'zxcvbn';
import { toFormikValidationSchema } from '@/lib/zod-formik';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(15, 'Password must be at least 15 characters'),
});

type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
  indicatorClassName: string;
};

const BREACHED_PASSWORD_ERROR = 'Password has been found in a data breach. Choose a different password.';

function evaluatePasswordStrength(password: string): PasswordStrength {
  const { score } = zxcvbn(password);

  if (score === 0) {
    return { score: 0, label: 'Very weak', indicatorClassName: 'bg-destructive' };
  }

  if (score === 1) {
    return { score: 1, label: 'Weak', indicatorClassName: 'bg-orange-500' };
  }

  if (score === 2) {
    return { score: 2, label: 'Fair', indicatorClassName: 'bg-yellow-500' };
  }

  if (score === 3) {
    return { score: 3, label: 'Strong', indicatorClassName: 'bg-lime-500' };
  }

  return { score: 4, label: 'Very strong', indicatorClassName: 'bg-emerald-500' };
}

async function checkPasswordBreach(password: string): Promise<number | null> {
  try {
    if (typeof fetch !== 'function' || !globalThis.crypto?.subtle) return null;

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', passwordBuffer);
    const passwordHash = Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const prefix = passwordHash.slice(0, 5);
    const suffix = passwordHash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return null;

    const responseText = await response.text();
    const matchedLine = responseText
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith(suffix));

    if (!matchedLine) return 0;

    const count = matchedLine.split(':')[1];
    const parsedCount = Number.parseInt(count ?? '0', 10);
    return Number.isNaN(parsedCount) ? 0 : parsedCount;
  } catch {
    return null;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(registerSchema),
    onSubmit: async (values) => {
      setError('');
      setIsCheckingPassword(true);

      const breachCount = await checkPasswordBreach(values.password);
      if (breachCount !== null && breachCount > 0) {
        setIsCheckingPassword(false);
        setError(BREACHED_PASSWORD_ERROR);
        return;
      }

      const errorMessage = await register(values.email, values.password, values.name, 'user');
      setIsCheckingPassword(false);

      if (errorMessage?.toLowerCase().includes('data breach')) {
        setError(BREACHED_PASSWORD_ERROR);
        return;
      }

      if (errorMessage) setError(errorMessage);
    },
  });

  const passwordStrength = evaluatePasswordStrength(formik.values.password);
  let submitButtonLabel = 'Create account';
  if (isLoading) {
    submitButtonLabel = 'Creating account…';
  } else if (isCheckingPassword) {
    submitButtonLabel = 'Checking password…';
  }

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
              {formik.values.password.length > 0 && (
                <div className="space-y-1.5 pt-1" aria-live="polite">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${passwordStrength.indicatorClassName}`}
                      style={{ width: `${Math.max(8, (passwordStrength.score / 4) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className="font-medium text-foreground">{passwordStrength.label}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">Use 15+ characters with upper/lowercase, numbers, and symbols.</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive pt-1">{error}</p>
            )}

            <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading || isCheckingPassword}>
              {submitButtonLabel}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
