'use client';


import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { useAdminStore, type ActivityLog } from '@/store/admin-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

export default function AdminActivityPage() {
  const logs = useAdminStore(s => s.logs);
  const logsPage = useAdminStore(s => s.logsPage);
  const logsTotal = useAdminStore(s => s.logsTotal);
  const logsTotalPages = useAdminStore(s => s.logsTotalPages);
  const logsLimit = useAdminStore(s => s.logsLimit);
  const isLoadingLogs = useAdminStore(s => s.isLoadingLogs);
  const fetchLogs = useAdminStore(s => s.fetchLogs);

  useEffect(() => {
    fetchLogs(1, 20);
  }, [fetchLogs]);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<ActivityLog>[] = [
    {
      accessorKey: 'userName',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          User <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.username}</span>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.action}</span>,
    },
    {
      accessorKey: 'target',
      header: 'Target',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-64 truncate block">{row.original.target || '—'}</span>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Time <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {DateTime.fromISO(row.original.timestamp).toFormat('MMM dd, HH:mm')}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: logs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Full log of user actions on the platform</p>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Filter by user…"
          value={(table.getColumn('userName')?.getFilterValue() as string) ?? ''}
          onChange={e => table.getColumn('userName')?.setFilterValue(e.target.value)}
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
        <span className="text-xs text-muted-foreground flex-1">{logsTotal} log(s) • Page {logsPage} / {logsTotalPages}</span>
        <Button variant="outline" size="sm" onClick={() => fetchLogs(logsPage - 1, logsLimit)} disabled={isLoadingLogs || logsPage <= 1}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => fetchLogs(logsPage + 1, logsLimit)} disabled={isLoadingLogs || logsPage >= logsTotalPages}>Next</Button>
      </div>
    </div>
  );
}
