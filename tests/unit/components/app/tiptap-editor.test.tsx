import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TiptapEditor } from '@/components/app/tiptap-editor';

const useEditorMock = vi.fn();
const editorContentMock = vi.fn(({ className }: { className?: string }) => (
  <div data-testid="editor-content" className={className} />
));

vi.mock('@tiptap/react', async () => {
  const React = await import('react');
  return {
    useEditor: (...args: unknown[]) => useEditorMock(...args),
    EditorContent: (props: unknown) => editorContentMock(props as { className?: string }),
    EditorContext: React.createContext({ editor: null }),
  };
});

vi.mock('@tiptap/starter-kit', () => ({
  default: {
    configure: vi.fn(() => ({ name: 'starter-kit' })),
  },
}));

vi.mock('@tiptap/markdown', () => ({
  Markdown: { name: 'markdown-extension' },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

describe('TiptapEditor', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    editorContentMock.mockClear();
  });

  it('renders null when editor instance is not ready', () => {
    useEditorMock.mockReturnValue(null);

    const onChange = vi.fn();
    const { container } = render(<TiptapEditor content="# title" onChange={onChange} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders toolbar, triggers onUpdate, and executes all toolbar commands', () => {
    const onChange = vi.fn();

    const chain = {
      focus: vi.fn(),
      toggleHeading: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleBulletList: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBlockquote: vi.fn(),
      setHorizontalRule: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      run: vi.fn(),
    };

    chain.focus.mockReturnValue(chain);
    chain.toggleHeading.mockReturnValue(chain);
    chain.toggleBold.mockReturnValue(chain);
    chain.toggleItalic.mockReturnValue(chain);
    chain.toggleBulletList.mockReturnValue(chain);
    chain.toggleOrderedList.mockReturnValue(chain);
    chain.toggleBlockquote.mockReturnValue(chain);
    chain.setHorizontalRule.mockReturnValue(chain);
    chain.undo.mockReturnValue(chain);
    chain.redo.mockReturnValue(chain);

    const mockEditor = {
      isActive: vi.fn((name: string, attrs?: { level?: number }) => name === 'heading' && attrs?.level === 3),
      can: vi.fn(() => ({
        undo: () => false,
        redo: () => true,
      })),
      chain: vi.fn(() => chain),
    };

    useEditorMock.mockImplementation((options: { onUpdate: ({ editor }: { editor: { getHTML: () => string } }) => void }) => {
      options.onUpdate({ editor: { getHTML: () => '<p>changed</p>' } });
      return mockEditor;
    });

    render(<TiptapEditor content="hello" onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith('<p>changed</p>');
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(11);
    expect(buttons[9]).toBeDisabled();
    expect(buttons[10]).not.toBeDisabled();

    buttons.forEach((button) => fireEvent.click(button));

    expect(chain.toggleHeading).toHaveBeenCalledWith({ level: 1 });
    expect(chain.toggleHeading).toHaveBeenCalledWith({ level: 2 });
    expect(chain.toggleHeading).toHaveBeenCalledWith({ level: 3 });
    expect(chain.toggleBold).toHaveBeenCalled();
    expect(chain.toggleItalic).toHaveBeenCalled();
    expect(chain.toggleBulletList).toHaveBeenCalled();
    expect(chain.toggleOrderedList).toHaveBeenCalled();
    expect(chain.toggleBlockquote).toHaveBeenCalled();
    expect(chain.setHorizontalRule).toHaveBeenCalled();
    expect(chain.redo).toHaveBeenCalled();
  });

  it('renders with opposite active/can states to cover conditional variants', () => {
    const chain = {
      focus: vi.fn(),
      toggleHeading: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleBulletList: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBlockquote: vi.fn(),
      setHorizontalRule: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      run: vi.fn(),
    };

    chain.focus.mockReturnValue(chain);
    chain.toggleHeading.mockReturnValue(chain);
    chain.toggleBold.mockReturnValue(chain);
    chain.toggleItalic.mockReturnValue(chain);
    chain.toggleBulletList.mockReturnValue(chain);
    chain.toggleOrderedList.mockReturnValue(chain);
    chain.toggleBlockquote.mockReturnValue(chain);
    chain.setHorizontalRule.mockReturnValue(chain);
    chain.undo.mockReturnValue(chain);
    chain.redo.mockReturnValue(chain);

    const mockEditor = {
      isActive: vi.fn(() => true),
      can: vi.fn(() => ({
        undo: () => true,
        redo: () => false,
      })),
      chain: vi.fn(() => chain),
    };

    useEditorMock.mockReturnValue(mockEditor);

    render(<TiptapEditor content="hello" onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[9]).not.toBeDisabled();
    expect(buttons[10]).toBeDisabled();

    fireEvent.click(buttons[9]);
    expect(chain.undo).toHaveBeenCalled();
  });

  it('renders with all inactive marks', () => {
    const chain = {
      focus: vi.fn(),
      toggleHeading: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleBulletList: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBlockquote: vi.fn(),
      setHorizontalRule: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      run: vi.fn(),
    };

    chain.focus.mockReturnValue(chain);
    chain.toggleHeading.mockReturnValue(chain);
    chain.toggleBold.mockReturnValue(chain);
    chain.toggleItalic.mockReturnValue(chain);
    chain.toggleBulletList.mockReturnValue(chain);
    chain.toggleOrderedList.mockReturnValue(chain);
    chain.toggleBlockquote.mockReturnValue(chain);
    chain.setHorizontalRule.mockReturnValue(chain);
    chain.undo.mockReturnValue(chain);
    chain.redo.mockReturnValue(chain);

    const mockEditor = {
      isActive: vi.fn(() => false),
      can: vi.fn(() => ({
        undo: () => true,
        redo: () => true,
      })),
      chain: vi.fn(() => chain),
    };

    useEditorMock.mockReturnValue(mockEditor);

    render(<TiptapEditor content="hello" onChange={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(11);
  });
});
