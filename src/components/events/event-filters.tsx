'use client';

import { Formik, Form, Field } from 'formik';
import { useEventStore } from '@/store/event-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const categories = ['Concert', 'Workshop', 'Seminar', 'Sports', 'Festival', 'Other'];

export function EventFilters() {
  const { filters, setFilters } = useEventStore();

  return (
    <Formik
      initialValues={{
        search: filters.search,
        category: filters.category,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: filters.sortBy,
      }}
      onSubmit={(values) => {
        setFilters(values);
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Field name="search">
            {({ field }: { field: unknown }) => (
              <Input placeholder="Search events..." {...(field as object)} />
            )}
          </Field>

          <Field name="category">
            {({ field }: { field: unknown }) => (
              <Select
                value={values.category}
                onValueChange={(val) => {
                  setFieldValue('category', val === 'all' ? '' : val);
                  setFilters({ category: val === 'all' ? '' : val });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field name="dateFrom">
            {({ field }: { field: unknown }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !values.dateFrom && 'text-muted-foreground'
                    )}
                  >
                    {values.dateFrom ? format(new Date(values.dateFrom), 'MMM d, yyyy') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values.dateFrom ? new Date(values.dateFrom) : undefined}
                    onSelect={(date) => {
                      const dateStr = date?.toISOString() || '';
                      setFieldValue('dateFrom', dateStr);
                      setFilters({ dateFrom: dateStr });
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </Field>

          <Field name="dateTo">
            {({ field }: { field: unknown }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !values.dateTo && 'text-muted-foreground'
                    )}
                  >
                    {values.dateTo ? format(new Date(values.dateTo), 'MMM d, yyyy') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values.dateTo ? new Date(values.dateTo) : undefined}
                    onSelect={(date) => {
                      const dateStr = date?.toISOString() || '';
                      setFieldValue('dateTo', dateStr);
                      setFilters({ dateTo: dateStr });
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </Field>

          <Field name="sortBy">
            {({ field }: { field: unknown }) => (
              <Select
                value={values.sortBy}
                onValueChange={(val) => {
                  setFieldValue('sortBy', val);
                  setFilters({ sortBy: val as 'date' | 'price' | 'popularity' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="popularity">Sort by Popularity</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>
        </Form>
      )}
    </Formik>
  );
}
