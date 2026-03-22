'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountTypePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const roleConfig: Record<string, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-red-500/20 text-red-400' },
    organizer: { label: 'Organizer', className: 'bg-primary/20 text-primary' },
    user: { label: 'Attendee', className: 'bg-muted text-muted-foreground' },
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="rounded-xl border bg-card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Account Type</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your current role and permissions on Tickale
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${roleConfig[user?.role ?? 'user']?.className}`}>
              <ShieldCheck className={`h-5 w-5 ${roleConfig[user?.role ?? 'user']?.className.split(' ')[1]}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{roleConfig[user?.role ?? 'user']?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user?.role === 'admin'
                  ? 'Full platform access including user management, events, and refunds.'
                  : user?.role === 'organizer'
                  ? 'Create and manage events, view ticket sales, and handle check-ins.'
                  : 'Browse events and purchase tickets to attend.'}
              </p>
            </div>
          </div>
          {user?.role === 'user' && (
            <div className="mt-4 p-4 rounded-xl border border-dashed text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Want to create and manage your own events?
              </p>
              <Button size="sm" variant="outline">
                Upgrade to Organizer
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-red-200 overflow-hidden">
        <div className="px-5 py-4 bg-red-50/50 border-b border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-sm text-red-600">Danger Zone</h2>
          </div>
        </div>
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently remove your account and all data. This cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 shrink-0"
            onClick={() => toast.error('Account deletion is not available in demo mode.')}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-red-200 overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-500">Sign Out</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Log out of your Tickale account on this device.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 shrink-0"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
