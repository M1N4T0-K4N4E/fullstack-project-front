import { describe, expect, it, vi } from 'vitest';

vi.mock('@shaderfrog/glsl-parser', () => {
  const parse = vi.fn(() => ({ kind: 'ast' }));
  const generate = vi.fn((node: { value?: string }) => node?.value ?? '');
  return { parse, generate };
});

vi.mock('@shaderfrog/glsl-parser/ast', () => {
  const visit = vi.fn((_: unknown, visitor: { declarator_list: { enter: (p: any) => void } }) => {
    const makeNode = (type: string, qualifiers: string, name: string, hint: string, parent = true) => ({
      node: {
        specified_type: {
          specifier: { value: type },
          qualifiers: { value: qualifiers },
        },
        declarations: { value: name },
      },
      parent: parent
        ? {
            type: 'declaration_statement',
            semi: { whitespace: { value: hint } },
          }
        : { type: 'other' },
    });

    visitor.declarator_list.enter(makeNode('float', 'uniform', 'uTime', '// min:1 max:2 default:1 step:1'));
    visitor.declarator_list.enter(makeNode('float', 'uniform', 'uResolution', '// min:1 max:2 default:1 step:1'));
    visitor.declarator_list.enter(makeNode('float', 'uniform', 'uCells', '// min:2 max:20 default:8 step:1'));
    visitor.declarator_list.enter(makeNode('vec3', 'uniform', 'uBaseColor', '// color default:#257cff'));
    visitor.declarator_list.enter(makeNode('sampler2D', 'uniform', 'uTexture', '// default:0'));
    visitor.declarator_list.enter(makeNode('unknown_type', 'uniform', 'uUnknown', '// default:1'));
    visitor.declarator_list.enter(makeNode('float', 'const', 'uIgnored', '// default:1'));
    visitor.declarator_list.enter(makeNode('float', 'uniform', 'bad name', '// default:1'));
    visitor.declarator_list.enter(makeNode('float', 'uniform', 'uNoParent', '// default:1', false));
  });

  return { visit };
});

import { MAP_PROGRAM_UNIFORM, PROGRAM_UNIFORMS, UNIFORM_CONTROLS, UNIFORM_DEFAULT, UNIFORMS, type UNIFORM_DATA_TYPE } from '@/components/app/ogl/shader';

describe('ogl shader utilities', () => {
  it('extracts and maps GLSL uniforms with hint parsing and filtering', () => {
    const uniforms = UNIFORMS('void main(){}');

    expect(uniforms).toHaveLength(3);

    expect(uniforms[0]).toMatchObject({
      name: 'uCells',
      type: 'number',
      hint: { min: 2, max: 20, default: 8, step: 1 },
    });

    expect(uniforms[1]).toMatchObject({
      name: 'uBaseColor',
      type: 'vector3',
      hint: { isColor: true, default: '#257cff' },
    });

    expect(uniforms[2]).toMatchObject({
      name: 'uTexture',
      type: 'texture',
      hint: { default: 0 },
    });
  });

  it('creates default values per uniform type and throws for unsupported type', () => {
    const uniforms: UNIFORM_DATA_TYPE[] = [
      { name: 'v2', type: 'vector2', hint: {} },
      { name: 'v3colorHex', type: 'vector3', hint: { isColor: true, default: '#ffffff' } },
      { name: 'v3colorBadHex', type: 'vector3', hint: { isColor: true, default: '#zzzzzz' } },
      { name: 'v3colorNoHex', type: 'vector3', hint: { isColor: true, default: 1 } },
      { name: 'v3', type: 'vector3', hint: {} },
      { name: 'v4colorHex', type: 'vector4', hint: { isColor: true, default: '#112233' } },
      { name: 'v4colorBadHex', type: 'vector4', hint: { isColor: true, default: '#xyxyxy' } },
      { name: 'v4colorNoHex', type: 'vector4', hint: { isColor: true, default: 1 } },
      { name: 'v4', type: 'vector4', hint: {} },
      { name: 'num', type: 'number', hint: {} },
    ];

    const defaults = UNIFORM_DEFAULT(uniforms);

    expect(defaults.v2).toEqual([0, 0]);
    expect(defaults.v3colorHex).toEqual({ r: 255, g: 255, b: 255 });
    expect(defaults.v3colorBadHex).toEqual({ r: 0, g: 0, b: 0 });
    expect(defaults.v3colorNoHex).toEqual({ r: 0, g: 0, b: 0 });
    expect(defaults.v3).toEqual([0, 0, 0]);
    expect(defaults.v4colorHex).toEqual({ r: 17, g: 34, b: 51, a: 255 });
    expect(defaults.v4colorBadHex).toEqual({ r: 0, g: 0, b: 0, a: 255 });
    expect(defaults.v4colorNoHex).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(defaults.v4).toEqual([0, 0, 0]);
    expect(defaults.num).toBe(0);

    expect(() =>
      UNIFORM_DEFAULT([
        { name: 'bad', type: 'mat2', hint: {} },
      ] as UNIFORM_DATA_TYPE[]),
    ).toThrowError('');
  });

  it('creates control schemas for numbers, colors, and fallback values', () => {
    const controls = UNIFORM_CONTROLS([
      { name: 'numberRange', type: 'number', hint: { default: 3, min: 1, max: 5, step: 0.5 } },
      { name: 'numberRangeFallbacks', type: 'number', hint: { min: 1 } },
      { name: 'numberRangeMinFallback', type: 'number', hint: { max: 9 } },
      { name: 'numberSimple', type: 'number', hint: { default: 2 } },
      { name: 'numberDefaultZero', type: 'number', hint: {} },
      { name: 'color3Hex', type: 'vector3', hint: { isColor: true, default: '#336699' } },
      { name: 'color3BadHex', type: 'vector3', hint: { isColor: true, default: '#xyzxyz' } },
      { name: 'color3Fallback', type: 'vector3', hint: { isColor: true, default: 1 } },
      { name: 'color4Hex', type: 'vector4', hint: { isColor: true, default: '#112233' } },
      { name: 'color4BadHex', type: 'vector4', hint: { isColor: true, default: '#xyxyxy' } },
      { name: 'color4Fallback', type: 'vector4', hint: { isColor: true, default: 1 } },
      { name: 'fallbackVector2', type: 'vector2', hint: {} },
    ]);

    expect(controls.numberRange).toEqual({ value: 3, min: 1, max: 5, step: 0.5 });
    expect(controls.numberRangeFallbacks).toEqual({ value: 0, min: 1, max: 1, step: 0.01 });
    expect(controls.numberRangeMinFallback).toEqual({ value: 0, min: 0, max: 9, step: 0.01 });
    expect(controls.numberSimple).toBe(2);
    expect(controls.numberDefaultZero).toBe(0);
    expect(controls.color3Hex).toEqual({ r: 51, g: 102, b: 153 });
    expect(controls.color3BadHex).toEqual({ r: 0, g: 0, b: 0 });
    expect(controls.color3Fallback).toEqual({ r: 0, g: 0, b: 0 });
    expect(controls.color4Hex).toEqual({ r: 17, g: 34, b: 51, a: 255 });
    expect(controls.color4BadHex).toEqual({ r: 0, g: 0, b: 0, a: 255 });
    expect(controls.color4Fallback).toEqual({ r: 0, g: 0, b: 0, a: 255 });
    expect(controls.fallbackVector2).toEqual([0, 0]);
  });

  it('maps runtime uniform values for program consumption', () => {
    expect(MAP_PROGRAM_UNIFORM(5)).toBe(5);
    expect(MAP_PROGRAM_UNIFORM({ r: 255, g: 128, b: 0 })).toEqual([1, 128 / 255, 0]);

    // Current implementation converts rgba via the rgb path first.
    expect(MAP_PROGRAM_UNIFORM({ r: 255, g: 0, b: 127, a: 64 })).toEqual([1, 0, 127 / 255]);

    let firstBCheck = true;
    const rgbaProxy = new Proxy({ r: 255, g: 128, b: 64, a: 32 }, {
      has(target, key) {
        if (key === 'b' && firstBCheck) {
          firstBCheck = false;
          return false;
        }
        return key in target;
      },
      get(target, key) {
        return target[key as keyof typeof target];
      },
    });

    expect(MAP_PROGRAM_UNIFORM(rgbaProxy)).toEqual([1, 128 / 255, 64 / 255, 32 / 255]);

    expect(PROGRAM_UNIFORMS({
      scalar: 2,
      color: { r: 255, g: 255, b: 255 },
    })).toEqual({
      scalar: { value: 2 },
      color: { value: [1, 1, 1] },
    });
  });
});
