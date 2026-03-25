'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, CSSProperties } from 'react';
import { client } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { CodeBlock } from '@/components/app/code-block/code-block';
import { highlight } from '@/components/app/code-block/shared';
import { Footer } from '@/components/app/footer';
import { MarkdownBlock } from '@/components/app/markdown-block/markdown-block';
import { OGLDefaultFragment, OGLDefaultVertex } from '@/components/app/ogl/default';
import { OGL } from '@/components/app/ogl/ogl';
import { MAP_PROGRAM_UNIFORM, UNIFORM_DEFAULT, UNIFORMS } from '@/components/app/ogl/shader';
import { OGLProvider, useOGLContext } from '@/components/app/ogl/store';
import { SiteHeader } from '@/components/app/site-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Avvvatars from 'avvvatars-react';
import { useControls, Leva, LevaInputs } from 'leva';
import { CopyIcon, HeartIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PostData {
  id: string;
  title: string;
  context: string;
  vertex: string;
  fragment: string;
  authorName: string;
  like: number;
  dislike: number;
  thumbnail: string | null;
}

const ShaderPreview = ({ vertex, fragment }: { vertex: string; fragment: string }) => {
  const $uTime = useOGLContext((s) => s.time);
  const $program = useOGLContext((s) => s.program);
  const [values] = useControls(() => ({
    ...UNIFORM_DEFAULT(UNIFORMS(fragment)),
    uTime: { type: LevaInputs.STRING, editable: false, value: (0).toFixed(4) },
  }));
  const initials = useMemo(() => values, []);

  useEffect(() => {
    if ($program) {
      for (const k in values) {
        if (k === 'uTime') continue;
        if (k === 'uResolution') continue;
        $program.uniforms[k].value = MAP_PROGRAM_UNIFORM((values as Record<string, unknown>)[k]);
      }
    }
  }, [$uTime]);

  return <OGL vertex={vertex} fragment={fragment} uniforms={{ ...initials, uTime: { value: 0 } }} />;
};

export default function ShaderDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const { isAuthenticated, getAuthClient } = useAuthStore();

  const [post, setPost] = useState<PostData | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!postId) return;
    client.GET('/api/posts/{id}', { params: { path: { id: postId } } }).then(({ data }) => {
      if (data?.post) {
        const p = data.post;
        setPost({
          id: p.id ?? postId,
          title: p.title ?? '',
          context: p.context ?? '',
          vertex: p.vertex ?? OGLDefaultVertex,
          fragment: p.fragment ?? OGLDefaultFragment,
          authorName: p.user?.name ?? '',
          like: p.like ?? 0,
          dislike: p.dislike ?? 0,
          thumbnail: p.thumbnail ?? null,
        });
        setLikeCount(p.like ?? 0);
      }
    });
  }, [postId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to like shaders');
      return;
    }
    const c = getAuthClient();
    await c.PUT('/api/posts/like/{id}', { params: { path: { id: postId } } });
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const vertex = post?.vertex ?? OGLDefaultVertex;
  const fragment = post?.fragment ?? OGLDefaultFragment;

  return (
    <>
      <div className="mt-4" />
      <div className="py-4">
        <div className="flex justify-between">
          <div className="text-3xl pb-2">{post?.title ?? '…'}</div>
          <Button variant="ghost" onClick={handleCopyLink}>
            <CopyIcon />
            Copy Link
          </Button>
        </div>
        <div className="h-8 flex gap-2 items-center text-muted-foreground">
          <div className="flex gap-2 items-center">
            <Avatar size="sm">
              <AvatarFallback>
                <Avvvatars border={false} size={24} style="shape" value={(post?.authorName ?? 'unknown').replace('@', '-')} />
              </AvatarFallback>
            </Avatar>
            {post?.authorName ?? '…'}
          </div>
          <Separator orientation="vertical" className="my-2 shrink-0" />
          <div className="ml-auto" />
          <Button onClick={handleLike}>
            <HeartIcon fill={liked ? 'red' : 'none'} color={liked ? 'red' : undefined} />
            <div className="px-1">+{likeCount}</div>
          </Button>
        </div>
      </div>
      <OGLProvider>
        <div className="relative">
          <div className="flex aspect-4/3 *:size-full *:max-h-full not-has-[[data-paper-shader]]:bg-header xs:aspect-3/2 md:aspect-16/9">
            <div className="flex overflow-hidden *:size-full data-resizable:resize [[style*='width']]:resize">
              <ShaderPreview vertex={vertex} fragment={fragment} />
            </div>
          </div>
          <div
            className="absolute -top-[1px] -right-[332px] hidden w-[300px] overflow-auto rounded-md bg-(--color-leva-background) pb-2 has-[[data-leva-container]>[style*='display:none']]:hidden lg:block squircle:rounded"
            style={{
              '--spacing': 1,
              boxShadow: `
                  rgba(58, 34, 17, 0.1) 0px 4px 40px -8px,
                  rgba(58, 34, 17, 0.2) 0px 12px 20px -8px,
                  rgba(58, 34, 17, 0.1) 0px 0px 0px 1px
                `,
            } as CSSProperties}
          >
            <div className="-mb-14 cursor-default p-[10px] font-mono text-[11px]">Presets</div>
            <div data-leva-container>
              <Leva
                fill
                flat
                hideCopyButton
                titleBar={false}
                theme={{
                  fonts: { mono: 'var(--font-mono)' },
                  colors: {
                    elevation1: 'var(--color-leva-separators)',
                    elevation2: 'transparent',
                    elevation3: 'var(--color-leva-input)',
                    accent1: 'var(--color-leva-control-pressed)',
                    accent2: 'var(--color-leva-button)',
                    accent3: 'var(--color-leva-control-pressed)',
                    highlight2: 'var(--color-foreground)',
                    folderTextColor: 'var(--color-foreground)',
                  },
                  sizes: { folderTitleHeight: '28px', numberInputMinWidth: '7ch' },
                }}
              />
            </div>
          </div>
        </div>
      </OGLProvider>
      <div className="mt-6" />
      {post?.context && <MarkdownBlock content={post.context} />}
      <div className="mt-6" />
      <div className="flex gap-4 flex-col">
        <CodeBlock name="vertex.glsl" initial={highlight(vertex, 'glsl')} />
        <CodeBlock name="fragment.glsl" initial={highlight(fragment, 'glsl')} />
      </div>
      <div className="-mb-16 mt-6">
        <Footer />
      </div>
    </>
  );
}
