'use client';

import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Avvvatars from 'avvvatars-react';
import { Formik, Form, Field } from 'formik';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';

const nameSchema = z.object({
  value: z.string({ error: 'Name is required' }).min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
});

const emailSchema = z.object({
  value: z.string({ error: 'Email is required' }).email('Please enter a valid email address'),
});

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState<'name' | 'email' | null>(null);

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
              {/* Display name */}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Display name</span>
                {editing === 'name' ? (
                  <Formik
                    initialValues={{ value: user.name }}
                    validationSchema={toFormikValidationSchema(nameSchema)}
                    onSubmit={async (values) => {
                      await updateProfile({ name: values.value });
                      setEditing(null);
                    }}
                  >
                    {({ errors, touched, submitForm }) => (
                      <Form className="flex items-center gap-2">
                        <div>
                          <Field
                            as={Input}
                            name="value"
                            className="h-8 w-48 text-sm"
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Escape') setEditing(null);
                            }}
                          />
                          {errors.value && touched.value && (
                            <p className="text-xs text-destructive mt-0.5">{errors.value}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="size-7" type="submit">
                          <CheckIcon className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" type="button" onClick={() => setEditing(null)}>
                          <XIcon className="size-3.5" />
                        </Button>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditing('name')}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {/* Email */}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">Email</span>
                {editing === 'email' ? (
                  <Formik
                    initialValues={{ value: user.email }}
                    validationSchema={toFormikValidationSchema(emailSchema)}
                    onSubmit={(values) => {
                      updateProfile({ email: values.value });
                      setEditing(null);
                    }}
                  >
                    {({ errors, touched }) => (
                      <Form className="flex items-center gap-2">
                        <div>
                          <Field
                            as={Input}
                            name="value"
                            className="h-8 w-48 text-sm"
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Escape') setEditing(null);
                            }}
                          />
                          {errors.value && touched.value && (
                            <p className="text-xs text-destructive mt-0.5">{errors.value}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="size-7" type="submit">
                          <CheckIcon className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" type="button" onClick={() => setEditing(null)}>
                          <XIcon className="size-3.5" />
                        </Button>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.email}</span>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditing('email')}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {/* User ID */}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
              </div>
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
