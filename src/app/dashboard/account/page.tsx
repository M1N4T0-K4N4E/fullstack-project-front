'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { user, logout } = useAuthStore();

  const initialValues: AccountFormValues = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  };

  const handleSubmit = (values: AccountFormValues, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
    // Mock update - in real app would call API
    toast.success('Account updated successfully!');
    setSubmitting(false);
  };

  const handlePasswordSubmit = (values: PasswordFormValues, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
    // Mock update - in real app would call API
    toast.success('Password updated successfully!');
    setSubmitting(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'organizer':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <div className="mb-6">
          <Badge variant={getRoleBadgeVariant(user?.role || 'user')} className="text-sm px-3 py-1">
            {user?.role}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={toFormikValidationSchema(accountSchema)}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Field as={Input} id="name" name="name" />
                    <ErrorMessage name="name" component="p" className="text-sm text-red-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Field as={Input} id="email" name="email" type="email" />
                    <ErrorMessage name="email" component="p" className="text-sm text-red-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Field as={Input} id="phone" name="phone" placeholder="081-234-5678" />
                    <ErrorMessage name="phone" component="p" className="text-sm text-red-500" />
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Formik<PasswordFormValues>
              initialValues={{ currentPassword: '', newPassword: '' }}
              validationSchema={toFormikValidationSchema(passwordSchema)}
              onSubmit={handlePasswordSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Field as={Input} id="currentPassword" name="currentPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Field as={Input} id="newPassword" name="newPassword" type="password" />
                    <ErrorMessage name="newPassword" component="p" className="text-sm text-red-500" />
                  </div>

                  <Button type="submit" variant="outline" disabled={isSubmitting}>
                    Update Password
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout}>
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
