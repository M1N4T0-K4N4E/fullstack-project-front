'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileTextIcon, PlusIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useFormik } from 'formik';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';

const createPostSchema = z.object({
  title: z.string({ error: 'Title is required' }).min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
});

function CreatePostForm({ onSubmit, onCancel }: { onSubmit: (title: string) => void; onCancel: () => void }) {
  const formik = useFormik({
    initialValues: { title: '' },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(createPostSchema),
    onSubmit: (values) => {
      onSubmit(values.title);
      formik.resetForm();
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-1 py-2">
        <label className="text-xs text-muted-foreground uppercase tracking-widest">Title</label>
        <Input name="title" placeholder="Enter post title…" onChange={formik.handleChange} value={formik.values.title} />
        {formik.errors.title && formik.touched.title && (
          <p className="text-xs text-destructive">{formik.errors.title}</p>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>Cancel</Button>
        <Button size="sm" type="submit">Create</Button>
      </DialogFooter>
    </form>
  );
}

interface MyPost {
  id: string;
  title: string;
  authorName: string;
  removed: boolean;
  thumbnail?: string | null;
}

export default function MyPostsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, getAuthClient } = useAuthStore();
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [ready, setReady] = useState(false)
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.push('/login');
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    const c = getAuthClient();
    c.GET('/api/posts/@me').then(({ data }) => {
      if (Array.isArray(data)) {
        setMyPosts(data.map((p) => ({
          id: p.id ?? '',
          title: p.title ?? '',
          authorName: p.user?.name ?? '',
          removed: false,
          thumbnail: p.thumbnail ?? null,
        })));
        setReady(true)
      }
    });
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated || !isAuthenticated || !user || !ready) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCreate = async (title: string) => {
    const c = getAuthClient();
    const { data } = await c.POST('/api/posts', { body: { title: title.trim() } });
    setCreateOpen(false);
    if (data?.postId) {
      router.push(`/my-posts/${data.postId}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const c = getAuthClient();
    await c.DELETE('/api/posts/{id}', { params: { path: { id: deleteTarget.id } } });
    setMyPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="px-6">
        <div className="flex-1 w-full max-w-6xl mx-auto py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">My Posts</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{myPosts.length} shader(s) published</p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4 mr-1.5" /> New Post
            </Button>
          </div>

          {myPosts.length === 0 ? (
            <div className="border rounded-lg p-16 text-center space-y-4">
              <div className="size-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <FileTextIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No posts yet</p>
                <p className="text-xs text-muted-foreground">Upload your first shader to get started.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                <PlusIcon className="size-4 mr-1.5" /> Create Post
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myPosts.map((post) => (
                <div key={post.id} className={`group relative flex flex-col border rounded-md w-full overflow-hidden ${post.removed ? 'opacity-50' : ''}`}>
                  <img
                    className="object-cover aspect-video overflow-hidden w-full"
                    src={post.thumbnail ?? '/transition_02-ezgif.com-optimize-1.gif'}
                    alt=""
                  />
                  {post.removed && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="text-[10px]">Removed</Badge>
                    </div>
                  )}
                  {!post.removed && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="size-7 shadow-md">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem asChild>
                            <Link href={`/my-posts/${post.id}/edit`}>
                              <PencilIcon className="size-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget({ id: post.id, title: post.title })}>
                            <Trash2Icon className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <div className="p-4 font-bold">{post.title}</div>
                  <div className="mt-auto" />
                  <div className="border-t bg-card px-4 py-2 flex justify-between items-center">
                    <span className="text-sm">{user.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Post</DialogTitle>
          </DialogHeader>
          <CreatePostForm onSubmit={(title) => handleCreate(title)} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-medium text-foreground">"{deleteTarget?.title}"</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
