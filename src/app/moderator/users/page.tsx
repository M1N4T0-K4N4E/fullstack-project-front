'use client';


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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Avvvatars from 'avvvatars-react';
import { ArrowUpDown, TimerIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { Formik, Form } from 'formik';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';
import React, { useEffect, useMemo, useState } from 'react';

const timeoutSchema = z.object({
  duration: z.string({ error: 'Please select a duration' }).min(1, 'Please select a duration'),
});

function TimeoutDialog({ user, open, onClose }: { user: ManagedUser | null; open: boolean; onClose: () => void }) {
  const timeoutUser = useAdminStore(s => s.timeoutUser);
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Timeout {user?.name}</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{ duration: '30' }}
          validationSchema={toFormikValidationSchema(timeoutSchema)}
          onSubmit={(values) => {
            if (user) timeoutUser(user.id, Number(values.duration));
            onClose();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="space-y-1 py-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Duration</label>
                <Select value={values.duration} onValueChange={(v) => setFieldValue('duration', v)}>
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
                <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
                <Button size="sm" type="submit">Apply timeout</Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default function ModeratorUsersPage() {
  const { users, fetchUsers } = useAdminStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    fetchUsers();
  }, []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [timeoutTarget, setTimeoutTarget] = useState<ManagedUser | null>(null);

  const managedUsers = useMemo(() => users.filter(u => u.role === 'user'), [users]);

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
        if (u.status === 'banned') return <Badge variant="destructive" className="text-xs">Banned</Badge>;
        return (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTimeoutTarget(u)}>
            <TimerIcon className="size-3.5 mr-1" /> Timeout
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: managedUsers,
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
        <p className="text-sm text-muted-foreground mt-0.5">Timeout users who violate community guidelines</p>
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
              <TableRow key={row.id} className="h-14">
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
