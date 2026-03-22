'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketIcon, Calendar, MapPin, Users, Shield, CreditCard, Smartphone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'organizer') {
        router.push('/dashboard/organizer');
      } else {
        router.push('/dashboard/user');
      }
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm">
            The Ultimate Event Ticketing Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Discover & Book <span className="text-primary">Amazing Events</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            From concerts to workshops, sports to festivals - find your next experience and get tickets in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => router.push('/events')}>
              Browse Events <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleGetStarted}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Tickale?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Secure Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every ticket comes with QR code verification. No more fake tickets or double-booking issues.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Smartphone className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Mobile Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access your tickets anywhere, anytime. Show QR codes directly from your phone at the venue.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CreditCard className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Easy Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quick and secure payment process. Get your tickets in just a few taps.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">Browse by Category</h2>
          <p className="text-muted-foreground text-center mb-12">Find events that match your interests</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Concert', icon: TicketIcon, color: 'bg-purple-100 text-purple-600' },
              { name: 'Workshop', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
              { name: 'Sports', icon: Users, color: 'bg-green-100 text-green-600' },
              { name: 'Seminar', icon: MapPin, color: 'bg-orange-100 text-orange-600' },
              { name: 'Festival', icon: Calendar, color: 'bg-pink-100 text-pink-600' },
              { name: 'More', icon: ArrowRight, color: 'bg-gray-100 text-gray-600' },
            ].map((category) => (
              <Link key={category.name} href={`/events?category=${category.name}`}>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-3`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-sm">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event-goers and organizers on Tickale today.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" onClick={handleGetStarted}>
            {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold">Tickale</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Tickale. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground">
              Events
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
