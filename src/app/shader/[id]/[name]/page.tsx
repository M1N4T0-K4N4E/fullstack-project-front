'use client';
import { CodeBlock } from '@/components/app/code-block/code-block';
import { highlight } from '@/components/app/code-block/shared';
import { Footer } from '@/components/app/footer';
import { MarkdownBlock } from '@/components/app/markdown-block/markdown-block';
import { OGLDefaultFragment, OGLDefaultVertex } from '@/components/app/ogl/default';
import { OGL } from '@/components/app/ogl/ogl';
import { MAP_PROGRAM_UNIFORM, UNIFORM_DEFAULT, UNIFORMS } from '@/components/app/ogl/shader';
import { OGLProvider, useOGLContext } from '@/components/app/ogl/store';
import { SiteHeader } from '@/components/app/site-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Avvvatars from "avvvatars-react"
import { useControls, Leva, LevaInputs } from 'leva'
import { CopyIcon, HeartIcon } from 'lucide-react';
import { DateTime } from "luxon";
import { CSSProperties, useEffect, useMemo, useRef } from 'react';

const ShaderPreview = () => {
  const $uTime = useOGLContext(s => s.time)
  const $program = useOGLContext(s => s.program)
  const [values, set, get] = useControls(() => ({
    ...UNIFORM_DEFAULT(UNIFORMS(OGLDefaultFragment)),
    uTime: { type: LevaInputs.STRING, editable: false, value: (0).toFixed(4) },
  }))
  const initials = useMemo(() => values, [])

  useEffect(() => {
    // set({ uTime: $uTime.toFixed(4) })
    if ($program) {
      for (const k in values) {
        if (k == 'uTime') continue;
        if (k == 'uResolution') continue;
        $program.uniforms[k].value = MAP_PROGRAM_UNIFORM((values as any)[k])
      }
    }
  }, [$uTime])

  useEffect(() => {
    console.log(UNIFORMS(OGLDefaultFragment))
    console.log(initials)
  }, [])

  return <>
    <OGL vertex={OGLDefaultVertex} fragment={OGLDefaultFragment} uniforms={{ ...initials, uTime: { value: 0 } }}></OGL>
  </>
}

export default () => {
  const liked = false
  const markdown = `# Hello World\nThis is **bold** text.`
  const title = "Transition Shader With Patterns"
  return <>
    <div className='mt-4'></div>
    <div className='py-4'>
      <div className='flex justify-between'>
        <div className='text-3xl pb-2'>
          {title}
        </div>
        <Button variant="ghost">
          <CopyIcon></CopyIcon>
          Copy Link
        </Button>
      </div>
      <div className='h-8 flex gap-2 items-center text-muted-foreground'>
        <div className='flex gap-2 items-center'>
          <Avatar size="sm">
            <AvatarImage src="" />
            <AvatarFallback>
              <Avvvatars border={false} size={24} style="shape" value={"tim@apple.com".replace("@", "-")} />
            </AvatarFallback>
          </Avatar>
          boon4681
        </div>
        <Separator orientation='vertical' className='my-2 shrink-0'></Separator>
        <div>{DateTime.fromISO('2025-02-25T09:08:34.123').toFormat('LLLL dd, yyyy')}</div>
        <Separator orientation='vertical' className='my-2 shrink-0'></Separator>
        <div className='ml-auto'></div>
        <Button>
          <HeartIcon fill={liked ? 'red' : 'none'} color={liked ? 'red' : undefined}></HeartIcon>
          <div className='px-1'>+{10}</div>
        </Button>
      </div>
    </div>
    <OGLProvider>
      <div className="relative">
        <div
          className="flex aspect-4/3 *:size-full *:max-h-full not-has-[[data-paper-shader]]:bg-header xs:aspect-3/2 md:aspect-16/9"
        >
          <div
            className="flex overflow-hidden *:size-full data-resizable:resize [[style*='width']]:resize"
          >
            <ShaderPreview></ShaderPreview>
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
                fonts: {
                  mono: 'var(--font-mono)',
                },
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
                sizes: {
                  folderTitleHeight: '28px',
                  numberInputMinWidth: '7ch',
                },
              }}
            />
          </div>
        </div>
      </div>
    </OGLProvider>
    <div className='mt-6'></div>
    <MarkdownBlock content={markdown}></MarkdownBlock>
    <div className='mt-6'></div>
    <div className='flex gap-4 flex-col'>
      <CodeBlock name='vertex.glsl' initial={highlight(OGLDefaultVertex, 'glsl')}></CodeBlock>
      <CodeBlock name='fragment.glsl' initial={highlight(OGLDefaultFragment, 'glsl')}></CodeBlock>
    </div>
    <div className='-mb-16 mt-6'>
      <Footer></Footer>
    </div>
  </>
}