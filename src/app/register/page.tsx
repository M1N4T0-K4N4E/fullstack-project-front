'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function RegisterContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Sign up to start buying or creating events
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />
                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function RegisterSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <Skeleton className="h-8 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<RegisterSkeleton />}>
            <RegisterContent />
        </Suspense>
    );
}
