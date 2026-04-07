'use client'
import { Mesh, Program, Renderer, Triangle } from "ogl"
import { useEffect, useRef } from "react"
import { useOGLContext } from "./store"
import { PROGRAM_UNIFORMS } from "./shader"

export const OGL = ({ vertex, fragment, uniforms }: React.PropsWithChildren<{ vertex: string, fragment: string, uniforms?: Record<string, any> }>) => {
  const updateTime = useOGLContext((s) => s.update)
  const setProgram = useOGLContext(s => s.setProgram)
  const ref = useRef<HTMLDivElement>(null)
  const renderer = useRef<Renderer>(null)
  const meshRef = useRef<Mesh>(null)
  const geometryRef = useRef<Triangle>(null)
  const animRef = useRef<number>(0)

  const resize = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !renderer.current) return;
    renderer.current.setSize(rect.width, rect.height);
  }

  // Initialize renderer once
  useEffect(() => {
    if (renderer.current) return;
    renderer.current = new Renderer()
    const gl = renderer.current.gl;
    ref.current!.appendChild(gl.canvas);
    gl.clearColor(1, 1, 1, 1);
    const observe = new ResizeObserver(resize)
    observe.observe(ref.current!)
    geometryRef.current = new Triangle(gl);

    resize();
    return () => {
      observe.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  // Recreate program when vertex/fragment change
  useEffect(() => {
    if (!renderer.current || !geometryRef.current) return;
    const gl = renderer.current.gl;

    cancelAnimationFrame(animRef.current)

    let program: Program;
    try {
      program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          ...PROGRAM_UNIFORMS(uniforms),
          uTime: { value: 0 },
          uResolution: { value: [renderer.current.width, renderer.current.height] }
        },
      });
    } catch {
      // Invalid shader code — skip until it's valid
      return;
    }

    setProgram(program)
    const mesh = new Mesh(gl, { geometry: geometryRef.current, program });
    meshRef.current = mesh;

    function update(t: number) {
      animRef.current = requestAnimationFrame(update);
      updateTime(t * 0.001)
      program.uniforms.uTime.value = t * 0.001;
      renderer.current!.render({ scene: mesh });
    }
    animRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [vertex, fragment])

  return <div ref={ref}>
  </div>
}