'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { Ticket, ArrowLeft } from 'lucide-react';

function RegisterContent() {
  const searchParams = useSearchParams();
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

        <div className="relative z-10 space-y-8">
          {[
            { label: 'Concerts & Festivals', desc: 'Never miss your favorite artists live' },
            { label: 'Sports & Workshops', desc: 'Secure your spot at any event' },
            { label: 'QR-verified tickets', desc: 'Fakes are not a thing here' },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="font-semibold text-lg">{item.label}</p>
              <p className="text-sm opacity-60">{item.desc}</p>
            </div>
          ))}
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
            <h1 className="font-heading text-2xl font-bold mb-1.5">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Join Tickale to discover and book events
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterSkeleton() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-foreground p-10" />
      <div className="flex flex-col justify-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-sm space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterContent />
    </Suspense>
  );
}
