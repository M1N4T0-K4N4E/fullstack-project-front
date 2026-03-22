'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavHeader } from '@/components/shared/nav-header';
import {
  Zap,
  Ticket,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Music,
  Dribbble,
  GraduationCap,
  Mic2,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const categories = [
  { name: 'Concerts', icon: Music, color: 'bg-violet-500/10 text-violet-600' },
  { name: 'Sports', icon: Dribbble, color: 'bg-emerald-500/10 text-emerald-600' },
  { name: 'Workshops', icon: GraduationCap, color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Seminars', icon: Mic2, color: 'bg-blue-500/10 text-blue-600' },
  { name: 'Festivals', icon: PartyPopper, color: 'bg-pink-500/10 text-pink-600' },
  { name: 'Expos', icon: Sparkles, color: 'bg-orange-500/10 text-orange-600' },
];

const stats = [
  { value: '10K+', label: 'Events Hosted' },
  { value: '500K+', label: 'Tickets Sold' },
  { value: '50K+', label: 'Happy Users' },
  { value: '99.9%', label: 'Uptime' },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleAction = () => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'organizer') router.push('/dashboard/organizer');
      else router.push('/dashboard/user');
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[80px]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 px-4 py-1 text-sm font-normal">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Your tickets, zero hassle
            </Badge>

            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Find events.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Grab tickets.
              </span>
              <br />
              <span className="text-foreground">Go live.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              The fastest way to discover events, buy tickets, and get in. QR-coded, verified, and always in your pocket.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => router.push('/events')}>
                Explore Events
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleAction}
              >
                {isAuthenticated ? 'My Dashboard' : 'Start Free'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
              What are you into?
            </h2>
            <p className="text-muted-foreground">
              Browse events across every category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/events?category=${cat.name}`}>
                <div className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer">
                  <div className={`w-11 h-11 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
              Book in three steps
            </h2>
            <p className="text-muted-foreground">
              From discovery to QR scan — seamless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Find your event',
                desc: 'Search by name, filter by category, date, or price. Discover concerts, workshops, sports, and more.',
              },
              {
                step: '02',
                title: 'Buy your ticket',
                desc: 'Select your ticket type, enter your details, and complete checkout. Your ticket is generated instantly.',
              },
              {
                step: '03',
                title: 'Scan & enter',
                desc: 'Show your unique QR code at the venue. Verified, valid, and always in your pocket.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-heading font-bold text-muted/30 absolute -top-4 -left-1 select-none">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: QrCode,
                title: 'QR-coded tickets',
                desc: 'Every ticket comes with a unique QR code. Organizers scan it at the door for instant verification — no fakes, no double-booking.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure checkout',
                desc: 'Your payment info is protected. Tickets are delivered to your account the second your order is confirmed.',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex gap-4 rounded-xl border bg-card p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-16 md:px-12 md:py-20 text-background">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-muted/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-muted/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg mb-8 opacity-80">
                {isAuthenticated
                  ? "Jump back into your dashboard and manage your tickets."
                  : "Create your free account in 30 seconds and book your next event today."}
              </p>
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-muted gap-2"
                onClick={handleAction}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Ticket className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight">Tickale</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Events
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
            </nav>

            <p className="text-sm text-muted-foreground">
              © 2026 Tickale. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
