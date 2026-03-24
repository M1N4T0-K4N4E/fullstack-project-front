'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await register(email, password, name, 'user');
    if (!ok) setError('An account with this email already exists.');
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-widest">Display name</label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-10"
              />
            </div>

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
                autoComplete="new-password"
                className="h-10"
              />
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
