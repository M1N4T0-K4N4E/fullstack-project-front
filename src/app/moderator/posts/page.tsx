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
import { useAdminStore, type Post } from '@/store/admin-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { DateTime } from 'luxon';

export default function ModeratorPostsPage() {
  const { posts, removePost, restorePost } = useAdminStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Title <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: 'authorName',
      header: 'Author',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.authorName}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Posted <ArrowUpDown className="size-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {DateTime.fromISO(row.original.createdAt).toFormat('MMM dd, yyyy')}
        </span>
      ),
    },
    {
      accessorKey: 'removed',
      header: 'Status',
      cell: ({ row }) => row.original.removed
        ? <Badge variant="destructive" className="text-xs">Removed</Badge>
        : <Badge variant="secondary" className="text-xs">Live</Badge>,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return p.removed ? (
          <Button variant="ghost" size="icon" className="size-7" onClick={() => restorePost(p.id)}>
            <RotateCcwIcon className="size-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="size-7" onClick={() => removePost(p.id)}>
            <Trash2Icon className="size-4" />
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: posts,
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
        <h1 className="text-xl font-semibold">Posts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and moderate user-submitted content</p>
      </div>
      <div className="flex items-center">
        <Input
          placeholder="Filter by title…"
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={e => table.getColumn('title')?.setFilterValue(e.target.value)}
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
              <TableRow key={row.id} className={`h-14 ${row.original.removed ? 'opacity-50' : ''}`}>
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
        <span className="text-xs text-muted-foreground flex-1">{table.getFilteredRowModel().rows.length} post(s)</span>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </div>
  );
}
