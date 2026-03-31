import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShaderEditor } from '@/components/app/shader-editor';
import { highlight } from '@/components/app/code-block/shared';

vi.mock('@/components/app/code-block/shared', () => ({
  highlight: vi.fn(async (code: string) => <pre data-testid="highlighted">{code}</pre>),
}));

describe('ShaderEditor', () => {
  it('renders highlighted code and updates when value changes', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<ShaderEditor name="Fragment" value={'void main() {}'} onChange={onChange} />);

    expect(screen.getByText('Fragment')).toBeInTheDocument();
    expect(await screen.findByTestId('highlighted')).toHaveTextContent('void main() {}');
    expect(highlight).toHaveBeenCalledWith('void main() {}', 'glsl');

    rerender(<ShaderEditor name="Fragment" value={'void main(){gl_FragColor=vec4(1.); }'} onChange={onChange} />);

    expect(await screen.findByTestId('highlighted')).toHaveTextContent('void main(){gl_FragColor=vec4(1.); }');
    expect(highlight).toHaveBeenCalledWith('void main(){gl_FragColor=vec4(1.); }', 'glsl');
  });

  it('forwards textarea changes and keeps backdrop scroll in sync', async () => {
    const onChange = vi.fn();
    const { container } = render(<ShaderEditor name="Vertex" value={'line-1\nline-2'} onChange={onChange} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const backdrop = container.querySelector('div[aria-hidden="true"]') as HTMLDivElement;

    expect(textarea).toBeTruthy();
    expect(backdrop).toBeTruthy();
    expect(await screen.findByTestId('highlighted')).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'new shader source' } });
    expect(onChange).toHaveBeenCalledWith('new shader source');

    textarea.scrollTop = 120;
    textarea.scrollLeft = 45;
    fireEvent.scroll(textarea);

    expect(backdrop.scrollTop).toBe(120);
    expect(backdrop.scrollLeft).toBe(45);
  });
});
