'use client';

import { useState } from 'react';
import { useAdminStore } from '@/store/admin-store';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';

type SortOption = 'newest' | 'oldest' | 'title';

export default function DiscoverPage() {
  const { posts } = useAdminStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  const publicPosts = posts.filter(p => !p.removed);

  const filtered = publicPosts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.authorName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="px-6">
        <div className="w-full max-w-6xl mx-auto py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Discover</h1>
            <p className="text-sm text-muted-foreground mt-1">Browse shaders shared by the community</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or author…"
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sorted.length === 0 ? (
            <div className="border rounded-lg p-16 text-center space-y-2">
              <p className="text-sm font-medium">No shaders found</p>
              <p className="text-xs text-muted-foreground">
                {search ? 'Try a different search term.' : 'No shaders have been published yet.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{sorted.length} shader(s)</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sorted.map(post => (
                  <Link key={post.id} href={`/shader/${post.id}/${encodeURIComponent(post.title.toLowerCase().replace(/\s+/g, '-'))}`} className="h-full">
                    <div className="group flex flex-col border rounded-md w-full h-full overflow-hidden hover:border-foreground/30 transition-colors">
                      <img className="object-cover aspect-video overflow-hidden w-full" src="/transition_02-ezgif.com-optimize-1.gif" alt="" />
                      <div className="p-4 font-bold line-clamp-2">
                        {post.title}
                      </div>
                      <div className="mt-auto" />
                      <div className="border-t bg-card px-4 py-2 flex justify-between items-center">
                        <div className="text-sm">{post.authorName}</div>
                        <div className="text-xs text-muted-foreground">
                          {DateTime.fromISO(post.createdAt).toFormat('MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
