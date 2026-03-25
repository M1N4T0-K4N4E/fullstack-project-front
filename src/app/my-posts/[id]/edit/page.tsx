'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { OGLDefaultFragment, OGLDefaultVertex } from '@/components/app/ogl/default';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { TiptapEditor } from '@/components/app/tiptap-editor';
import { ShaderEditor } from '@/components/app/shader-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OGL } from '@/components/app/ogl/ogl';
import { OGLProvider } from '@/components/app/ogl/store';
import { UNIFORMS, UNIFORM_DEFAULT } from '@/components/app/ogl/shader';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useFormik } from 'formik';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';

const editPostSchema = z.object({
  title: z.string({ error: 'Title is required' }).min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  content: z.string({ error: 'Description is required' }),
  vertex: z.string({ error: 'Vertex shader is required' }).min(1, 'Vertex shader cannot be empty'),
  fragment: z.string({ error: 'Fragment shader is required' }).min(1, 'Fragment shader cannot be empty'),
});

interface PostData {
  title: string;
  content: string;
  vertex: string;
  fragment: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { user, isAuthenticated, hasHydrated, getAuthClient } = useAuthStore();
  const [post, setPost] = useState<PostData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (!hasHydrated || !postId || !isAuthenticated) return;
    const c = getAuthClient();
    c.GET('/api/posts/{id}', { params: { path: { id: postId } } }).then(({ data }) => {
      if (data?.post) {
        setPost({
          title: data.post.title ?? '',
          content: data.post.context ?? '',
          vertex: data.post.vertex ?? OGLDefaultVertex,
          fragment: data.post.fragment ?? OGLDefaultFragment,
        });
      } else {
        setNotFound(true);
      }
    });
  }, [hasHydrated, postId, isAuthenticated]);

  useEffect(() => {
    if (notFound) router.push('/my-posts');
  }, [notFound, router]);

  if (!hasHydrated || !isAuthenticated || !user || !post) {
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

  const handleSubmit = async (values: PostData) => {
    const c = getAuthClient();
    await c.PUT('/api/posts/{id}', {
      params: { path: { id: postId } },
      body: {
        title: values.title,
        context: values.content,
        vertex: values.vertex,
        fragment: values.fragment,
      },
    });
    router.push('/my-posts');
  };

  const formik = useFormik({
    initialValues: post,
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(editPostSchema),
    onSubmit: handleSubmit,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col">
        <div className="px-6">
          <div className="flex-1 w-full max-w-4xl mx-auto py-8 space-y-8 lg:max-w-6xl lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:space-y-0">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="size-8" asChild>
                    <Link href="/my-posts">
                      <ArrowLeftIcon className="size-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold">Edit Post</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Update your shader post</p>
                  </div>
                </div>
                <Button size="lg" type="submit">
                  <SaveIcon className="size-5 mr-1.5" /> Save
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Shader title…" onChange={formik.handleChange} value={formik.values.title} />
                {formik.errors.title && (formik.touched.title || formik.submitCount > 0) && (
                  <p className="text-xs text-destructive">{formik.errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <TiptapEditor content={formik.values.content} onChange={(v: string) => formik.setFieldValue('content', v)} />
              </div>

              <div className="space-y-2">
                <Label>Shader Code</Label>
                <Tabs defaultValue="vertex">
                  <TabsList>
                    <TabsTrigger value="vertex">vertex.glsl</TabsTrigger>
                    <TabsTrigger value="fragment">fragment.glsl</TabsTrigger>
                  </TabsList>
                  <TabsContent value="vertex">
                    <ShaderEditor name="vertex.glsl" value={formik.values.vertex} onChange={(v: string) => {
                      formik.setFieldValue('vertex', v)
                      console.log(v)
                    }} />
                    {formik.errors.vertex && (formik.touched.vertex || formik.submitCount > 0) && (
                      <p className="text-xs text-destructive mt-1">{formik.errors.vertex}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="fragment">
                    <ShaderEditor name="fragment.glsl" value={formik.values.fragment} onChange={(v: string) => formik.setFieldValue('fragment', v)} />
                    {formik.errors.fragment && (formik.touched.fragment || formik.submitCount > 0) && (
                      <p className="text-xs text-destructive mt-1">{formik.errors.fragment}</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Shader preview panel */}
            <div className="hidden lg:block">
              <div className="sticky top-4 space-y-3">
                <p className="text-sm font-medium">Preview</p>
                <div className="rounded-md overflow-hidden border bg-black">
                  <OGLProvider>
                    <div className="aspect-square w-full *:size-full">
                      <OGL
                        vertex={formik.values.vertex}
                        fragment={formik.values.fragment}
                        uniforms={(() => {
                          try { return UNIFORM_DEFAULT(UNIFORMS(formik.values.fragment)); } catch { return {}; }
                        })()}
                      />
                    </div>
                  </OGLProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <Footer />
    </div>
  );
}
