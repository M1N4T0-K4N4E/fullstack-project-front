'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { useAdminStore, type ManagedUser } from '@/store/admin-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Avvvatars from 'avvvatars-react';
import { ArrowUpDown, MoreHorizontalIcon, ShieldIcon, ShieldOffIcon, TimerIcon, BanIcon, RotateCcwIcon } from 'lucide-react';
import { DateTime } from 'luxon';

function TimeoutDialog({ user, open, onClose }: { user: ManagedUser | null; open: boolean; onClose: () => void }) {
  const [duration, setDuration] = React.useState('30');
  const timeoutUser = useAdminStore(s => s.timeoutUser);
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Timeout {user?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          <label className="text-xs text-muted-foreground uppercase tracking-widest">Duration</label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="1440">24 hours</SelectItem>
              <SelectItem value="10080">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => { if (user) timeoutUser(user.id, Number(duration)); onClose(); }}>
            Apply timeout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const { users, banUser, unbanUser, promoteToModerator, demoteModerator } = useAdminStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [timeoutTarget, setTimeoutTarget] = React.useState<ManagedUser | null>(null);

  const columns: ColumnDef<ManagedUser>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          User <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>
              <Avvvatars border={false} size={24} style="shape" value={row.original.email.replace('@', '-')} />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        return <Badge variant={role === 'moderator' ? 'secondary' : 'outline'} className="capitalize text-xs">{role}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const u = row.original;
        const map = { active: 'secondary', banned: 'destructive', timed_out: 'outline' } as const;
        return (
          <div>
            <Badge variant={map[u.status]} className="text-xs capitalize">{u.status.replace('_', ' ')}</Badge>
            {u.status === 'timed_out' && u.timeoutUntil && (
              <p className="text-xs text-muted-foreground mt-0.5">until {DateTime.fromISO(u.timeoutUntil).toFormat('MMM dd, HH:mm')}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Joined <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {DateTime.fromISO(row.original.createdAt).toFormat('MMM dd, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const u = row.original;
        if (u.role === 'admin') return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {u.role === 'user' && (
                <DropdownMenuItem onClick={() => promoteToModerator(u.id)}>
                  <ShieldIcon className="size-4" /> Make moderator
                </DropdownMenuItem>
              )}
              {u.role === 'moderator' && (
                <DropdownMenuItem onClick={() => demoteModerator(u.id)}>
                  <ShieldOffIcon className="size-4" /> Remove moderator
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setTimeoutTarget(u)}>
                <TimerIcon className="size-4" /> Timeout
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {u.status === 'banned' ? (
                <DropdownMenuItem onClick={() => unbanUser(u.id)}>
                  <RotateCcwIcon className="size-4" /> Unban
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" onClick={() => banUser(u.id)}>
                  <BanIcon className="size-4" /> Ban user
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage accounts, roles, and access</p>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Filter by name…"
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 pt-4">
        <span className="text-xs text-muted-foreground flex-1">{table.getFilteredRowModel().rows.length} user(s)</span>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
      <TimeoutDialog user={timeoutTarget} open={!!timeoutTarget} onClose={() => setTimeoutTarget(null)} />
    </div>
  );
}
