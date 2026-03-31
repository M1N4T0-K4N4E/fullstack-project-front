import { describe, expect, it } from 'vitest';
import { OGLDefaultFragment, OGLDefaultVertex } from '@/components/app/ogl/default';

describe('ogl default shaders', () => {
  it('exports the default vertex shader source', () => {
    expect(OGLDefaultVertex).toContain('attribute vec2 uv;');
    expect(OGLDefaultVertex).toContain('gl_Position = vec4(position, 0, 1);');
    expect(OGLDefaultVertex.trim().startsWith('attribute vec2 uv;')).toBe(true);
  });

  it('exports the default fragment shader source', () => {
    expect(OGLDefaultFragment).toContain('precision highp float;');
    expect(OGLDefaultFragment).toContain('uniform float uTime;');
    expect(OGLDefaultFragment).toContain('gl_FragColor = vec4(col, 1.0);');
    expect(OGLDefaultFragment).toContain('for (int y = -1; y <= 1; y++)');
  });
});
