'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Ticket, ArrowLeft } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-muted/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-muted/10 blur-3xl" />

        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Tickale</span>
        </Link>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="font-heading text-3xl md:text-4xl font-bold leading-tight">
              "Tickale made buying concert tickets so much easier. In and out in under a minute."
            </p>
            <footer className="text-sm opacity-60">
              — Verified user
            </footer>
          </blockquote>
        </div>

        <p className="text-sm opacity-40 relative z-10">
          © 2026 Tickale. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold mb-1.5">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center space-y-1">
            <Link
              href="/forgot-password"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-muted-foreground">
              No account yet?{' '}
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-foreground p-10" />
      <div className="flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-sm space-y-4">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
