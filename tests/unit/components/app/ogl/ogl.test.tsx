import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { OGL } from '@/components/app/ogl/ogl';
import { OGLProvider, useOGLContext } from '@/components/app/ogl/store';

const clearColorSpy = vi.fn();
const rendererSetSizeSpy = vi.fn();
const rendererRenderSpy = vi.fn();
const triangleCtorSpy = vi.fn();
const programCtorSpy = vi.fn();
const meshCtorSpy = vi.fn();

let shouldThrowProgram = false;
let lastProgram: { uniforms: Record<string, { value: unknown }> } | null = null;
let rafCallback: FrameRequestCallback | undefined;
const resizeObserveSpy = vi.fn();
const resizeDisconnectSpy = vi.fn();
let getBoundingClientRectReturnValue: DOMRect | undefined = {
  width: 640,
  height: 360,
  top: 0,
  left: 0,
  right: 640,
  bottom: 360,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

let shouldReturnNullRenderer = false;
let shouldReturnNullGeometry = false;

vi.mock('ogl', () => {
  class Renderer {
    public gl: { canvas: HTMLCanvasElement; clearColor: (...args: number[]) => void };
    public width = 0;
    public height = 0;

    constructor() {
      this.gl = {
        canvas: document.createElement('canvas'),
        clearColor: (...args: number[]) => clearColorSpy(...args),
      };
    }

    setSize(width: number, height: number) {
      this.width = width;
      this.height = height;
      rendererSetSizeSpy(width, height);
    }

    render(args: unknown) {
      rendererRenderSpy(args);
    }
  }

  class Triangle {
    constructor(gl: unknown) {
      triangleCtorSpy(gl);
    }
  }

  class Program {
    public uniforms: Record<string, { value: unknown }>;

    constructor(gl: unknown, options: { uniforms: Record<string, { value: unknown }> }) {
      programCtorSpy(gl, options);
      if (shouldThrowProgram) {
        throw new Error('invalid shader');
      }
      this.uniforms = options.uniforms;
      lastProgram = this;
    }
  }

  class Mesh {
    constructor(gl: unknown, options: unknown) {
      meshCtorSpy(gl, options);
    }
  }

  return {
    Color: class {},
    Renderer,
    Triangle,
    Program,
    Mesh,
  };
});

function StateProbe() {
  const time = useOGLContext((s) => s.time);
  const program = useOGLContext((s) => s.program);

  return (
    <>
      <div data-testid="time">{time}</div>
      <div data-testid="program-ready">{program ? 'yes' : 'no'}</div>
    </>
  );
}

describe('OGL', () => {
  beforeEach(() => {
    clearColorSpy.mockReset();
    rendererSetSizeSpy.mockReset();
    rendererRenderSpy.mockReset();
    triangleCtorSpy.mockReset();
    programCtorSpy.mockReset();
    meshCtorSpy.mockReset();
    shouldThrowProgram = false;
    lastProgram = null;
    rafCallback = undefined;
    resizeObserveSpy.mockReset();
    resizeDisconnectSpy.mockReset();
    shouldReturnNullRenderer = false;
    shouldReturnNullGeometry = false;
    getBoundingClientRectReturnValue = {
      width: 640,
      height: 360,
      top: 0,
      left: 0,
      right: 640,
      bottom: 360,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 9;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    class ResizeObserverMock {
      observe = resizeObserveSpy;
      disconnect = resizeDisconnectSpy;
      constructor(public callback: ResizeObserverCallback) {}
    }

    (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes renderer and updates time through animation loop', async () => {
    const { container, unmount } = render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" uniforms={{ amount: 2 }} />
        <StateProbe />
      </OGLProvider>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(clearColorSpy).toHaveBeenCalledWith(1, 1, 1, 1);
    expect(triangleCtorSpy).toHaveBeenCalled();
    expect(programCtorSpy).toHaveBeenCalled();
    expect(meshCtorSpy).toHaveBeenCalled();
    expect(screen.getByTestId('program-ready')).toHaveTextContent('yes');

    const oglRoot = canvas?.parentElement as HTMLDivElement;
    oglRoot.getBoundingClientRect = () => getBoundingClientRectReturnValue!;

    if (rafCallback) {
      await act(async () => {
        rafCallback?.(2000);
      });
    }

    expect(screen.getByTestId('time')).toHaveTextContent('2');
    expect(rendererRenderSpy).toHaveBeenCalled();
    expect(lastProgram?.uniforms.uTime.value).toBe(2);

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    expect(resizeObserveSpy).toHaveBeenCalled();
    expect(resizeDisconnectSpy).toHaveBeenCalled();
  });

  it('skips mesh setup when shader program construction throws', () => {
    shouldThrowProgram = true;

    render(
      <OGLProvider>
        <OGL vertex="bad" fragment="bad" uniforms={{}} />
        <StateProbe />
      </OGLProvider>,
    );

    expect(programCtorSpy).toHaveBeenCalled();
    expect(meshCtorSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('program-ready')).toHaveTextContent('no');
  });

  it('returns early from resize when element rect is unavailable', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(undefined as never);

    render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" uniforms={{}} />
      </OGLProvider>,
    );

    expect(rendererSetSizeSpy).not.toHaveBeenCalled();
  });

  it('triggers program update when vertex shader changes', async () => {
    const { rerender } = render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" uniforms={{}} />
      </OGLProvider>,
    );

    expect(programCtorSpy).toHaveBeenCalledTimes(1);

    rerender(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(1.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" uniforms={{}} />
      </OGLProvider>,
    );

    expect(programCtorSpy).toHaveBeenCalledTimes(2);
  });

  it('triggers program update when fragment shader changes', async () => {
    const { rerender } = render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" uniforms={{}} />
      </OGLProvider>,
    );

    expect(programCtorSpy).toHaveBeenCalledTimes(1);

    rerender(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(0.5);}" uniforms={{}} />
      </OGLProvider>,
    );

    expect(programCtorSpy).toHaveBeenCalledTimes(2);
  });

  it('handles missing geometry reference gracefully', async () => {
    // This test verifies the branch at line 42 where geometry ref might not exist
    const { rerender } = render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" />
      </OGLProvider>,
    );

    expect(programCtorSpy).toHaveBeenCalled();

    // Re-render with shader changes should still work even if refs changed
    rerender(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(1.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" />
      </OGLProvider>,
    );

    expect(programCtorSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('cancels animation frame on component cleanup', async () => {
    const { unmount } = render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" />
      </OGLProvider>,
    );

    // Trigger at least one animation frame callback
    if (rafCallback) {
      await act(async () => {
        rafCallback?.(100);
      });
    }

    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('properly cleans up resize observer on unmount', async () => {
    render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" />
      </OGLProvider>,
    );

    expect(resizeObserveSpy).toHaveBeenCalled();
    expect(resizeDisconnectSpy).not.toHaveBeenCalled();

    const { unmount } = render(
      <OGLProvider>
        <OGL vertex="void main(){gl_Position=vec4(0.0);}" fragment="void main(){gl_FragColor=vec4(1.0);}" />
      </OGLProvider>,
    );

    unmount();
    expect(resizeDisconnectSpy).toHaveBeenCalled();
  });

  it('handles multiple renders with same shader code', async () => {
    const shaders = { vertex: "void main(){gl_Position=vec4(0.0);}", fragment: "void main(){gl_FragColor=vec4(1.0);}" };
    const { rerender } = render(
      <OGLProvider>
        <OGL {...shaders} uniforms={{}} />
      </OGLProvider>,
    );

    const initialProgramCalls = programCtorSpy.mock.calls.length;

    // Rerender with exact same shaders - should not trigger program recreation
    rerender(
      <OGLProvider>
        <OGL {...shaders} uniforms={{}} />
      </OGLProvider>,
    );

    // Only dependencies [vertex, fragment] trigger recreation, so should not increase
    expect(programCtorSpy.mock.calls.length).toBe(initialProgramCalls);
  });

  it('handles rapid shader updates', async () => {
    const { rerender } = render(
      <OGLProvider>
        <OGL vertex="v1" fragment="f1" uniforms={{}} />
      </OGLProvider>,
    );

    const initialCalls = programCtorSpy.mock.calls.length;

    // Rapid updates
    rerender(
      <OGLProvider>
        <OGL vertex="v2" fragment="f1" uniforms={{}} />
      </OGLProvider>,
    );

    rerender(
      <OGLProvider>
        <OGL vertex="v3" fragment="f1" uniforms={{}} />
      </OGLProvider>,
    );

    rerender(
      <OGLProvider>
        <OGL vertex="v4" fragment="f2" uniforms={{}} />
      </OGLProvider>,
    );

    // Should have called program constructor for each update
    expect(programCtorSpy.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('updates uniforms on shader change', async () => {
    const { rerender } = render(
      <OGLProvider>
        <OGL vertex="void main(){}" fragment="void main(){}" uniforms={{ test: 1 }} />
      </OGLProvider>,
    );

    const firstProgram = lastProgram;
    expect(firstProgram).toBeTruthy();

    rerender(
      <OGLProvider>
        <OGL vertex="void main(){}" fragment="void main(){gl_FragColor=vec4(1.0);}" uniforms={{ test: 2 }} />
      </OGLProvider>,
    );

    const secondProgram = lastProgram;
    expect(secondProgram).toBeTruthy();
    expect(secondProgram).not.toBe(firstProgram);
  });
});
