'use client'
import { Program } from 'ogl'
import { createContext, useContext, useRef } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'

interface OGLContext {
  time: number
  update: (t: number) => void,
  program: Program | undefined,
  setProgram: (p: Program | undefined) => void
}
const store = () => createStore<OGLContext>()((set) => ({
  time: 0,
  update(t: number) {
    set({ time: t })
  },
  program: undefined,
  setProgram(p) {
    set({ program: p })
  }
}))

type OGLContextStore = ReturnType<typeof store>
const OGLContext = createContext<OGLContextStore | null>(null)

export const OGLProvider = ({ children }: React.PropsWithChildren) => {
  const storeRef = useRef<OGLContextStore | null>(null)
  if (storeRef.current === null) {
    storeRef.current = store()
  }
  return (
    <OGLContext.Provider value={storeRef.current} >
      {children}
    </OGLContext.Provider>
  )
}

export function useOGLContext<T>(selector: (state: OGLContext) => T): T {
  const store = useContext(OGLContext)
  if (!store) throw new Error('useBearContext must be used within BearProvider')
  return useStore(store, selector)
}