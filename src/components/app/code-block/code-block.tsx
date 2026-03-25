import type { JSX } from 'react'
import type { BundledLanguage } from 'shiki/bundle/web'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, useLayoutEffect, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import { codeToHast } from 'shiki/bundle/web'
import { highlight } from './shared'
import { ScrollArea } from '@/components/ui/scroll-area'

function InternalCodeBlock({ initial }: { initial?: Promise<JSX.Element> }) {
  const [nodes, setNodes] = useState<JSX.Element | null>(null)

  useLayoutEffect(() => {
    initial?.then((resolved) => setNodes(resolved))
  }, [initial])

  return nodes ?? <p>Loading...</p>
}

export function CodeBlock({ initial, name }: { initial?: Promise<JSX.Element>, name: string }) {
  return <>
    <div className='rounded-md overflow-hidden bg-[#1f1f1f]'>
      <div className='z-10 relative px-4 text-sm p-[10px] text-muted-foreground'>
        {name}
      </div>
      <ScrollArea type='always' className='w-full [&>[data-slot=scroll-area-viewport]]:max-h-[800px]'>
        <InternalCodeBlock initial={initial}></InternalCodeBlock>
      </ScrollArea>
    </div >
  </>
}