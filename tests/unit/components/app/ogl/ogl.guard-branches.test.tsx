import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const rendererCtorSpy = vi.fn();
const programCtorSpy = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  let refCall = 0;

  return {
    ...actual,
    useRef: <T,>(initialValue: T) => {
      refCall += 1;
      // OGL refs call order: root ref, renderer ref, mesh ref, geometry ref, anim ref.
      // Force renderer ref to be already initialized so init effect returns early.
      if (refCall === 2) {
        return { current: {} } as { current: T };
      }
      return actual.useRef(initialValue);
    },
  };
});

vi.mock('ogl', () => {
  class Renderer {
    constructor() {
      rendererCtorSpy();
    }
  }

  class Program {
    constructor() {
      programCtorSpy();
    }
  }

  class Mesh {
    constructor() {}
  }

  class Triangle {
    constructor() {}
  }

  return {
    Color: class {},
    Renderer,
    Program,
    Mesh,
    Triangle,
  };
});

vi.mock('@/components/app/ogl/shader', () => ({
  PROGRAM_UNIFORMS: () => ({}),
}));

vi.mock('@/components/app/ogl/store', () => ({
  useOGLContext: (selector: (s: { update: (n: number) => void; setProgram: (p: unknown) => void }) => unknown) =>
    selector({ update: () => {}, setProgram: () => {} }),
}));

import { OGL } from '@/components/app/ogl/ogl';

describe('OGL guard branches', () => {
  it('covers init/program early-return guards when renderer is pre-initialized', () => {
    render(<OGL vertex="v" fragment="f" uniforms={{}} />);

    expect(rendererCtorSpy).not.toHaveBeenCalled();
    expect(programCtorSpy).not.toHaveBeenCalled();
  });
});
