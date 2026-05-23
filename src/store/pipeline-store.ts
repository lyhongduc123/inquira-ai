import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ChatPipelineMode = "research" | "agent"

interface PipelineState {
  pipeline: ChatPipelineMode
  hasHydrated: boolean
  setPipeline: (pipeline: ChatPipelineMode) => void
  setHasHydrated: (value: boolean) => void
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set) => ({
      pipeline: "research",
      hasHydrated: false,
      setPipeline: (pipeline) => set({ pipeline }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "exegent_chat_pipeline_mode",
      partialize: (state) => ({ pipeline: state.pipeline }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function getCurrentPipelineMode(): ChatPipelineMode {
  return usePipelineStore.getState().pipeline
}
