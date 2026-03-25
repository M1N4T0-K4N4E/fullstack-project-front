'use client';

import { type JSX, useCallback, useEffect, useRef, useState } from 'react';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { codeToHast } from 'shiki/bundle/web';
import { highlight } from './code-block/shared';

interface ShaderEditorProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export function ShaderEditor({ value, onChange, name }: ShaderEditorProps) {
  const [highlighted, setHighlighted] = useState<JSX.Element | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const doHighlight = useCallback(async (code: string) => {
    const result = await highlight(code, 'glsl');
    setHighlighted(result);
  }, []);

  useEffect(() => {
    doHighlight(value);
  }, [value, doHighlight]);

  const syncScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="rounded-md overflow-hidden bg-[#1f1f1f]">
      <div className="px-4 text-sm p-[10px] text-muted-foreground">
        {name}
      </div>
      <div className="relative">
        {/* Shiki highlighted backdrop */}
        <div
          ref={backdropRef}
          aria-hidden
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="shiki-backdrop [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:!bg-transparent [&_pre]:!font-mono [&_pre]:!text-sm [&_pre]:!leading-[1.625] [&_code]:!font-mono [&_code]:!text-sm [&_code]:!leading-[1.625] [&_.line]:!min-h-[1.625em]">
            {highlighted}
          </div>
        </div>
        {/* Transparent textarea on top */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          wrap="off"
          className="relative z-10 block w-full min-h-[300px] max-h-[600px] resize-y overflow-auto bg-transparent text-transparent caret-white selection:bg-white/20 font-mono text-sm leading-[1.625] p-4 pl-[4.5rem] outline-none whitespace-pre"
        />
      </div>
    </div>
  );
}
