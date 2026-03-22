'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="rounded-xl border bg-card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Change Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use a strong password with letters, numbers, and symbols.
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Current Password
            </Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter your current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              New Password
            </Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter a new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" className="gap-1.5" onClick={() => toast.success('Password updated!')}>
              <Lock className="h-3.5 w-3.5" />
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
