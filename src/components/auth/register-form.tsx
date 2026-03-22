'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'organizer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Formik
      initialValues={{ name: '', email: '', password: '', confirmPassword: '', role: 'user' as const }}
      validationSchema={toFormikValidationSchema(registerSchema)}
      onSubmit={async (values, { setSubmitting }) => {
        const success = await register(values.email, values.password, values.name, values.role);
        if (success) {
          toast.success('Registration successful!');
        } else {
          toast.error('Email already exists');
        }
        setSubmitting(false);
      }}
    >
      {({ errors, touched, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Field
              as={Input}
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className={errors.name && touched.name ? 'border-red-500' : ''}
            />
            <ErrorMessage name="name" component="p" className="text-sm text-red-500" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              className={errors.email && touched.email ? 'border-red-500' : ''}
            />
            <ErrorMessage name="email" component="p" className="text-sm text-red-500" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Field
                as={Input}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={errors.password && touched.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <ErrorMessage name="password" component="p" className="text-sm text-red-500" />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Field
              as={Input}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}
            />
            <ErrorMessage name="confirmPassword" component="p" className="text-sm text-red-500" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Type</label>
            <Field name="role">
              {() => (
                <RadioGroup
                  value={values.role}
                  onValueChange={(value) => setFieldValue('role', value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="role-user" />
                    <Label htmlFor="role-user">User - Buy tickets for events</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organizer" id="role-organizer" />
                    <Label htmlFor="role-organizer">Organizer - Create and manage events</Label>
                  </div>
                </RadioGroup>
              )}
            </Field>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
