import { useEffect, useState, createElement, useMemo } from 'react'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeParse from 'rehype-parse'
import rehypeSanitize from 'rehype-sanitize'
import rehypeReact from 'rehype-react'
import { unified } from 'unified'
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const components = {
  h1: (props: React.PropsWithChildren) => <h1 className='text-3xl font-bold mt-6 mb-4'>{props.children}</h1>,
  h2: (props: React.PropsWithChildren) => <h2 className='text-2xl font-bold mt-5 mb-3'>{props.children}</h2>,
  h3: (props: React.PropsWithChildren) => <h3 className='text-xl font-bold mt-4 mb-2'>{props.children}</h3>,
  h4: (props: React.PropsWithChildren) => <h4 className='text-lg font-bold mt-3 mb-2'>{props.children}</h4>,
  h5: (props: React.PropsWithChildren) => <h5 className='text-base font-bold mt-3 mb-2'>{props.children}</h5>,
  h6: (props: React.PropsWithChildren) => <h6 className='text-sm font-bold mt-3 mb-2'>{props.children}</h6>,
  p: (props: React.PropsWithChildren) => <p className='mb-4 leading-relaxed'>{props.children}</p>,
  a: (props: React.PropsWithChildren) => <a className="text-blue-600 hover:underline" {...props} />,
  strong: (props: React.PropsWithChildren) => <strong className='font-bold'>{props.children}</strong>,
  em: (props: React.PropsWithChildren) => <em className='italic'>{props.children}</em>,
  code: (props: React.PropsWithChildren) => <code className='bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono'>{props.children}</code>,
  pre: (props: React.PropsWithChildren) => <pre className="bg-zinc-900 text-white p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
  blockquote: (props: React.PropsWithChildren) => <blockquote className='border-l-4 border-zinc-300 pl-4 italic my-4'>{props.children}</blockquote>,
  ul: (props: React.PropsWithChildren) => <ul className='list-disc list-inside mb-4 ml-4'>{props.children}</ul>,
  ol: (props: React.PropsWithChildren) => <ol className='list-decimal list-inside mb-4 ml-4'>{props.children}</ol>,
  li: (props: React.PropsWithChildren) => <li className='mb-1'>{props.children}</li>,
  img: (props: any) => <img className='max-w-full h-auto rounded-lg my-4' {...props} />,
  hr: () => <hr className='my-6 border-t border-zinc-300' />,
  table: (props: React.PropsWithChildren) => <table className='w-full border-collapse border border-zinc-300 my-4'>{props.children}</table>,
  thead: (props: React.PropsWithChildren) => <thead className='bg-zinc-100'>{props.children}</thead>,
  tbody: (props: React.PropsWithChildren) => <tbody>{props.children}</tbody>,
  tr: (props: React.PropsWithChildren) => <tr className='border-b border-zinc-300'>{props.children}</tr>,
  th: (props: React.PropsWithChildren) => <th className='border border-zinc-300 p-2 text-left font-bold'>{props.children}</th>,
  td: (props: React.PropsWithChildren) => <td className='border border-zinc-300 p-2'>{props.children}</td>,
};

interface MarkdownBlockProps {
  content: string
}

export const MarkdownBlock = ({ content }: React.PropsWithChildren<MarkdownBlockProps>) => {
  const node = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeReact, { jsx, jsxs, Fragment, components })
      .processSync(content)
      .result;
  }, []);

  return <>{node}</>
}