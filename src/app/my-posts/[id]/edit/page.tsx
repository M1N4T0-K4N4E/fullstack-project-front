'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useAdminStore } from '@/store/admin-store';
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
import { Formik, Form, Field } from 'formik';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';

const editPostSchema = z.object({
  title: z.string({ error: 'Title is required' }).min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  content: z.string({ error: 'Description is required' }),
  vertex: z.string({ error: 'Vertex shader is required' }).min(1, 'Vertex shader cannot be empty'),
  fragment: z.string({ error: 'Fragment shader is required' }).min(1, 'Fragment shader cannot be empty'),
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { user, isAuthenticated } = useAuthStore();
  const { posts, editPost } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  const post = posts.find(p => p.id === postId);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !user)) {
      router.push('/login');
      return;
    }
    if (mounted && post && post.authorId !== user?.id) {
      router.push('/my-posts');
      return;
    }
    if (mounted && !post) {
      router.push('/my-posts');
      return;
    }
  }, [mounted, isAuthenticated, user, post, router]);

  if (!mounted || !isAuthenticated || !user || !post) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <Formik
        initialValues={{
          title: post.title,
          content: post.content,
          vertex: post.vertex,
          fragment: post.fragment,
        }}
        validationSchema={toFormikValidationSchema(editPostSchema)}
        enableReinitialize
        onSubmit={(values) => {
          editPost(postId, values);
          router.push('/my-posts');
        }}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className="flex-1 flex flex-col">
            <div className='px-6'>
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
                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      placeholder="Shader title…"
                    />
                    {errors.title && touched.title && (
                      <p className="text-xs text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <TiptapEditor content={values.content} onChange={(v: string) => setFieldValue('content', v)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Shader Code</Label>
                    <Tabs defaultValue="vertex">
                      <TabsList>
                        <TabsTrigger value="vertex">vertex.glsl</TabsTrigger>
                        <TabsTrigger value="fragment">fragment.glsl</TabsTrigger>
                      </TabsList>
                      <TabsContent value="vertex">
                        <ShaderEditor name="vertex.glsl" value={values.vertex} onChange={(v: string) => setFieldValue('vertex', v)} />
                        {errors.vertex && touched.vertex && (
                          <p className="text-xs text-destructive mt-1">{errors.vertex}</p>
                        )}
                      </TabsContent>
                      <TabsContent value="fragment">
                        <ShaderEditor name="fragment.glsl" value={values.fragment} onChange={(v: string) => setFieldValue('fragment', v)} />
                        {errors.fragment && touched.fragment && (
                          <p className="text-xs text-destructive mt-1">{errors.fragment}</p>
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
                          <OGL vertex={values.vertex} fragment={values.fragment} uniforms={(() => { try { return UNIFORM_DEFAULT(UNIFORMS(values.fragment)) } catch { return {} } })()} />
                        </div>
                      </OGLProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
      <Footer />
    </div>
  );
}
