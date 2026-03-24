'use client';

import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import Avvvatars from 'avvvatars-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && mounted) router.push('/');
  }, [isAuthenticated, mounted, router]);

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
        <Footer />
      </div>
    );
  }

  const createdDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SiteHeader />
      <div className='mx-auto w-full max-w-6xl'>
        {/* Hero band */}
        <div className="border-b max-w-3xl mx-auto border-border">
          <div className="w-full px-6 py-10 flex items-center gap-6">
            <Avatar className="size-20">
              <AvatarFallback>
                <Avvvatars border={false} size={80} style="shape" value={user.email.replace('@', '-')} />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold">{user.name}</span>
                <Badge variant="secondary" className="capitalize text-xs">{user.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Member since {createdDate}</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-8 space-y-10">

          {/* Details */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Account details</h2>
            <div className="divide-y divide-border">
              {[
                { label: 'Display name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'User ID', value: user.id, mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className={`text-sm ${mono ? 'font-mono text-xs text-muted-foreground' : 'font-medium'}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
              </div>
            </div>
          </section>

          {/* Session */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Session</h2>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground mt-0.5">End your current session on this device</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
