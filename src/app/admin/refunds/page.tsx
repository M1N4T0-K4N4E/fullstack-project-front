'use client';

import { NavHeader } from '@/components/shared/nav-header';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminRefundsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold">Refund Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">Process ticket refund requests</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pending */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="font-semibold text-sm">Pending Requests</h2>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  0
                </span>
              </div>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No pending refund requests</p>
              </div>
            </div>

            {/* Processed */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <h2 className="font-semibold text-sm">Processed</h2>
                <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                  0
                </span>
              </div>
              <div className="rounded-lg border border-dashed p-8 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No processed refunds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
