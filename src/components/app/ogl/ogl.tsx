'use client'
import { Color, Mesh, Program, Renderer, Triangle } from "ogl"
import { useEffect, useRef } from "react"
import { useOGLContext } from "./store"
import { PROGRAM_UNIFORMS } from "./shader"

export const OGL = ({ vertex, fragment, uniforms }: React.PropsWithChildren<{ vertex: string, fragment: string, uniforms?: Record<string, any> }>) => {
  const updateTime = useOGLContext((s) => s.update)
  const setProgram = useOGLContext(s => s.setProgram)
  const ref = useRef<HTMLDivElement>(null)
  const renderer = useRef<Renderer>(null)

  const resize = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !renderer.current) return;
    renderer.current.setSize(rect.width, rect.height);
  }
  useEffect(() => {
    if (renderer.current) return;
    renderer.current = new Renderer()
    const gl = renderer.current.gl;
    ref.current!.appendChild(gl.canvas);
    gl.clearColor(1, 1, 1, 1);
    const observe = new ResizeObserver(resize)
    observe.observe(ref.current!)
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        ...PROGRAM_UNIFORMS(uniforms),
        uTime: { value: 0 },
        uResolution: { value: [renderer.current.width, renderer.current.height] }
      },
    });

    setProgram(program)

    const mesh = new Mesh(gl, { geometry, program });

    function update(t: number) {
      requestAnimationFrame(update);
      updateTime(t * 0.001)
      program.uniforms.uTime.value = t * 0.001;
      renderer.current!.render({ scene: mesh });
    }
    requestAnimationFrame(update);

    resize();
    return () => {
      observe.disconnect()
    }
  }, [])

  return <div ref={ref}>
  </div>
}