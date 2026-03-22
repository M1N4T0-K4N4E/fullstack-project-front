'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const validate = async (values: LoginFormValues) => {
      const result = await loginSchema.safeParseAsync(values);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = issue.message;
          }
        }
        return errors;
      }
      return {};
    };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={validate}
      onSubmit={async (values, { setSubmitting }) => {
        const success = await login(values.email, values.password);
        if (success) {
          toast.success('Login successful!');
        } else {
          toast.error('Invalid email or password');
        }
        setSubmitting(false);
      }}
    >
      {({ errors, touched }) => (
        <Form className="space-y-4">
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
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <ErrorMessage name="password" component="p" className="text-sm text-red-500" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
