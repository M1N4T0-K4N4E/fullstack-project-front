'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, password);
    if (!ok) setError('Invalid email or password.');
  };

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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-widest">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-widest">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-10"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive pt-1">{error}</p>
            )}

            <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
