'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, Mail, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountProfilePage() {
  const { user } = useAuthStore();

  const roleConfig: Record<string, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-red-500/20 text-red-400' },
    organizer: { label: 'Organizer', className: 'bg-primary/20 text-primary' },
    user: { label: 'Attendee', className: 'bg-muted text-muted-foreground' },
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg ring-2 ring-background shadow-sm">
            {user ? getInitials(user.name) : '?'}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted border shadow-sm hover:bg-background transition-colors cursor-pointer">
            <Camera className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate">{user?.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
        </div>
        {user?.role && roleConfig[user.role] && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${roleConfig[user.role].className}`}>
            {roleConfig[user.role].label}
          </span>
        )}
      </div>

      <Separator />

      <div className="rounded-xl border bg-card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Personal Information</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update your personal details
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Full Name
              </Label>
              <Input defaultValue={user?.name || ''} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Email
              </Label>
              <Input defaultValue={user?.email || ''} type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Phone
              </Label>
              <Input defaultValue={user?.phone || ''} type="tel" placeholder="081-234-5678" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" className="gap-1.5" onClick={() => toast.success('Profile updated!')}>
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Notifications</h2>
        </div>
        <div className="divide-y">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Updates about your tickets</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs shrink-0">Manage</Button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">Alerts via text message</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs shrink-0">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
