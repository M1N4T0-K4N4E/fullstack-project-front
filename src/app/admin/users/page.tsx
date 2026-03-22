'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { NavHeader } from '@/components/shared/nav-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, ChevronDown } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { User, UserRole } from '@/types';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers(usersApi.getAll());
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleConfig: Record<UserRole, { label: string; className: string }> = {
    admin: { label: 'Admin', className: 'bg-red-100 text-red-700' },
    organizer: { label: 'Organizer', className: 'bg-primary/10 text-primary' },
    user: { label: 'Attendee', className: 'bg-muted text-muted-foreground' },
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold">User Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-14 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                >
                  {/* Avatar placeholder */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <Badge className={`text-xs shrink-0 ${roleConfig[user.role].className}`}>
                        {roleConfig[user.role].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">
                      Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <button className="shrink-0 p-1 text-muted-foreground hover:text-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
