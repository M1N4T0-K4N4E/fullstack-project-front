'use client';

import { useState, useEffect } from 'react';
import { client } from '@/lib/api';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';

type SortOption = 'newest' | 'oldest' | 'title';

interface ApiPost {
  id: string;
  title: string;
  authorName: string;
  thumbnail: string | null;
  like: number;
  dislike: number;
}

export default function DiscoverPage() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('title');

  useEffect(() => {
    client.GET('/api/posts').then(({ data }) => {
      if (data && Array.isArray(data)) {
        setPosts(
          data.map((p) => ({
            id: p.id ?? '',
            title: p.title ?? '',
            authorName: p.user?.name ?? '',
            thumbnail: p.thumbnail ?? null,
            like: p.like ?? 0,
            dislike: p.dislike ?? 0,
          }))
        );
      }
    });
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    return 0;
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author…"
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
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
                {sorted.map((post) => (
                  <Link
                    key={post.id}
                    href={`/shader/${post.id}/${encodeURIComponent(post.title.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="h-full"
                  >
                    <div className="group flex flex-col border rounded-md w-full h-full overflow-hidden hover:border-foreground/30 transition-colors">
                      <img
                        className="object-cover aspect-video overflow-hidden w-full"
                        src={post.thumbnail ?? '/transition_02-ezgif.com-optimize-1.gif'}
                        alt=""
                      />
                      <div className="p-4 font-bold line-clamp-2">{post.title}</div>
                      <div className="mt-auto" />
                      <div className="border-t bg-card px-4 py-2 flex justify-between items-center">
                        <div className="text-sm">{post.authorName}</div>
                        <div className="text-xs text-muted-foreground flex gap-3">
                          <span>♥ {post.like}</span>
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
