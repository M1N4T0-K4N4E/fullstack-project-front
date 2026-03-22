'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Ticket, Megaphone, Check, Eye, EyeOff } from 'lucide-react';

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

const accountTypes = [
  {
    value: 'user' as const,
    label: 'Attendee',
    desc: 'Browse events and buy tickets',
    icon: Ticket,
  },
  {
    value: 'organizer' as const,
    label: 'Organizer',
    desc: 'Create and manage your own events',
    icon: Megaphone,
  },
];

export function RegisterForm() {
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = async (values: RegisterFormValues) => {
    const result = await registerSchema.safeParseAsync(values);
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
      initialValues={{ name: '', email: '', password: '', confirmPassword: '', role: 'user' as const }}
      validate={validate}
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
        <Form className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Field
              as={Input}
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className={errors.name && touched.name ? 'border-red-500' : ''}
            />
            <ErrorMessage name="name" component="p" className="text-xs text-red-500" />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              className={errors.email && touched.email ? 'border-red-500' : ''}
            />
            <ErrorMessage name="email" component="p" className="text-xs text-red-500" />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Field
                as={Input}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                className={errors.password && touched.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <ErrorMessage name="password" component="p" className="text-xs text-red-500" />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Field
                as={Input}
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <ErrorMessage name="confirmPassword" component="p" className="text-xs text-red-500" />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">I want to...</Label>
            <div className="grid grid-cols-2 gap-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFieldValue('role', type.value)}
                  className={`
                    relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all cursor-pointer
                    ${values.role === type.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                    }
                  `}
                >
                  {values.role === type.value && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <type.icon className={`h-5 w-5 ${values.role === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-semibold">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
