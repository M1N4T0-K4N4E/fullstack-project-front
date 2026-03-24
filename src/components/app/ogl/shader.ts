import * as GLSL from '@shaderfrog/glsl-parser';
import * as GLSLAst from '@shaderfrog/glsl-parser/ast';
import { OGLDefaultFragment } from './default';
import { Schema } from 'leva/dist/declarations/src/types';

type ArrayType = 'array';
type Vector = 'vector2' | 'vector3' | 'vector4';
type Color = 'rgb' | 'rgba';
type Mat =
  | 'mat2'
  | 'mat3'
  | 'mat4'
  | 'mat2x2'
  | 'mat2x3'
  | 'mat2x4'
  | 'mat3x2'
  | 'mat3x3'
  | 'mat3x4'
  | 'mat4x2'
  | 'mat4x3'
  | 'mat4x4';

export type DataType =
  | Vector
  | Color
  | Mat
  | 'texture'
  | 'samplerCube'
  | 'number'
  | ArrayType;

export const DATA_TYPE_MAP: Readonly<[DataType, Set<string>][]> = [
  ['vector2', new Set(['bvec2', 'dvec2', 'ivec2', 'uvec2', 'vec2'])],
  ['number', new Set(['float', 'double', 'int', 'uint', 'atomic_uint'])],
  ['vector3', new Set(['bvec3', 'dvec3', 'ivec3', 'uvec3', 'vec3'])],
  ['vector4', new Set(['bvec4', 'dvec4', 'ivec4', 'uvec4', 'vec4'])],
  ['texture', new Set(['sampler2D'])],
  ['mat2', new Set(['mat2', 'dmat2'])],
  ['mat3', new Set(['mat3', 'dmat3'])],
  ['mat4', new Set(['mat4', 'dmat4'])],
  ['mat2x2', new Set(['mat2x2', 'dmat2x2'])],
  ['mat2x3', new Set(['mat2x3', 'dmat2x3'])],
  ['mat2x4', new Set(['mat2x4', 'dmat2x4'])],
  ['mat3x2', new Set(['mat3x2', 'dmat3x2'])],
  ['mat3x3', new Set(['mat3x3', 'dmat3x3'])],
  ['mat3x4', new Set(['mat3x4', 'dmat3x4'])],
  ['mat4x2', new Set(['mat4x2', 'dmat4x2'])],
  ['mat4x3', new Set(['mat4x3', 'dmat4x3'])],
  ['mat4x4', new Set(['mat4x4', 'dmat4x4'])],
];

export type UniformHint = {
  min?: number;
  max?: number;
  default?: any;
  step?: number;
  isColor?: boolean;
};

export type UNIFORM = { name: string, type: string, hint: UniformHint };

export type UNIFORM_DATA_TYPE = { name: string, type: DataType, hint: UniformHint };

const mapUniformType = (type: string): DataType | undefined => {
  const found = DATA_TYPE_MAP.find(([_, set]) => set.has(type));
  if (found) {
    return found[0];
  }
  // console.log(`Unknown uniform type, can't map to graph: ${type}`);
};

const parseUniformHint = (hintString: string): UniformHint => {
  const hint: UniformHint = {};

  // Check if it's a color hint
  if (hintString.includes('color')) {
    hint.isColor = true;
  }

  // Parse min value
  const minMatch = hintString.match(/min:([0-9.]+)/);
  if (minMatch) {
    hint.min = parseFloat(minMatch[1]);
  }

  // Parse max value
  const maxMatch = hintString.match(/max:([0-9.]+)/);
  if (maxMatch) {
    hint.max = parseFloat(maxMatch[1]);
  }

  // Parse step value
  const stepMatch = hintString.match(/step:([0-9.]+)/);
  if (stepMatch) {
    hint.step = parseFloat(stepMatch[1]);
  }

  // Parse default value
  const defaultMatch = hintString.match(/default:(#[0-9a-fA-F]+|[0-9.]+)/);
  if (defaultMatch) {
    const defaultVal = defaultMatch[1];
    hint.default = defaultVal.startsWith('#') ? defaultVal : parseFloat(defaultVal);
  }

  return hint;
};

export const UNIFORMS = (fragment: string) => {
  const ast = GLSL.parse(fragment, { stage: 'fragment' })
  console.log(ast)

  const uniforms: UNIFORM[] = []
  GLSLAst.visit(ast, {
    declarator_list: {
      enter(p) {
        const type = GLSL.generate(p.node.specified_type.specifier).trim()
        const uniform = GLSL.generate(p.node.specified_type.qualifiers).trim() == "uniform"
        const name = GLSL.generate(p.node.declarations).trim()
        const parent = p.parent?.type == "declaration_statement"
        if (!parent) return;
        if (name == 'uTime') return;
        if (name == 'uResolution') return;
        const hintString = (GLSL.generate((p.parent as GLSLAst.DeclarationStatementNode).semi.whitespace).trim().replace(/\/\//g, '')).trim()
        const pass = !(/\s/g.test(name) || /\s/g.test(type)) && uniform
        if (pass) uniforms.push({ name, type, hint: parseUniformHint(hintString) })
      }
    }
  })

  return uniforms.filter(a => mapUniformType(a.type)).map<UNIFORM_DATA_TYPE>(a => ({
    name: a.name,
    type: mapUniformType(a.type)!,
    hint: a.hint
  }))
}

type SchemaItemWithOptionsFromSchema = Schema[keyof Schema];

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
};

export const UNIFORM_DEFAULT = (uniforms: UNIFORM_DATA_TYPE[]) => {
  const map = (uniform: UNIFORM_DATA_TYPE): SchemaItemWithOptionsFromSchema => {
    switch (uniform.type) {
      case 'vector2':
        return uniform.hint.default ?? [0, 0]
      case 'vector3':
        if (uniform.hint.isColor) {
          if (typeof uniform.hint.default === 'string') {
            const rgb = hexToRgb(uniform.hint.default);
            return rgb ?? { r: 0, g: 0, b: 0 };
          }
          return {
            r: 0,
            g: 0,
            b: 0
          }
        }
        return uniform.hint.default ?? [0, 0, 0]
      case 'vector4':
        if (uniform.hint.isColor) {
          if (typeof uniform.hint.default === 'string') {
            const rgb = hexToRgb(uniform.hint.default);
            return rgb ? { ...rgb, a: 255 } : { r: 0, g: 0, b: 0, a: 255 };
          }
          return {
            r: 0,
            g: 0,
            b: 0,
            a: 0
          }
        }
        return uniform.hint.default ?? [0, 0, 0]
      case 'number':
        return uniform.hint.default ?? 0
    }
    throw new Error('')
  }
  const data: Schema = {}
  for (const k of uniforms) {
    data[k.name] = map(k)
  }
  return data
}

export const PROGRAM_UNIFORMS = (uniforms?: Record<string, any>) => {
  const program_uniforms: Record<string, any> = {}
  for (const k in uniforms) {
    program_uniforms[k] = { value: MAP_PROGRAM_UNIFORM(uniforms[k]) }
  }
  return program_uniforms
}

export const UNIFORM_CONTROLS = (uniforms: UNIFORM_DATA_TYPE[]): Schema => {
  const controls: Schema = {};

  for (const uniform of uniforms) {
    if (uniform.type === 'number') {
      const control: any = uniform.hint.default ?? 0;
      if (uniform.hint.min !== undefined || uniform.hint.max !== undefined) {
        controls[uniform.name] = {
          value: control,
          min: uniform.hint.min ?? 0,
          max: uniform.hint.max ?? 1,
          step: uniform.hint.step ?? 0.01,
        };
      } else {
        controls[uniform.name] = control;
      }
    } else if (uniform.type === 'vector3' && uniform.hint.isColor) {
      if (typeof uniform.hint.default === 'string') {
        const rgb = hexToRgb(uniform.hint.default);
        controls[uniform.name] = rgb ?? { r: 0, g: 0, b: 0 };
      } else {
        controls[uniform.name] = { r: 0, g: 0, b: 0 };
      }
    } else if (uniform.type === 'vector4' && uniform.hint.isColor) {
      if (typeof uniform.hint.default === 'string') {
        const rgb = hexToRgb(uniform.hint.default);
        controls[uniform.name] = rgb ? { ...rgb, a: 255 } : { r: 0, g: 0, b: 0, a: 255 };
      } else {
        controls[uniform.name] = { r: 0, g: 0, b: 0, a: 255 };
      }
    } else {
      controls[uniform.name] = UNIFORM_DEFAULT([uniform])[uniform.name];
    }
  }

  return controls;
};

export const MAP_PROGRAM_UNIFORM = (v: any) => {
  if (typeof v == 'number') return v
  if ('r' in v && 'g' in v && 'b' in v) v = [v.r, v.g, v.b].map(a => a / 255)
  if ('r' in v && 'g' in v && 'b' in v && 'a' in v) v = [v.r, v.g, v.b, v.a].map(a => a / 255)
  return v
}