import { useRef, useCallback } from "react";
import { MessageAreaRef } from "@/app/_components/MessageArea";
import { useQueryNavigatorStore } from "@/store/query-navigator-store";

export function useViewMode() {
  const messageAreaRef = useRef<MessageAreaRef>(null);

  const handleActiveQueryIndexChange = useCallback((index: number | null) => {
    const prev = useQueryNavigatorStore.getState().activeQueryIndex;
    if (prev !== index) {
      useQueryNavigatorStore.getState().setActiveQueryIndex(index);
    }
  }, []);
  
  const handleQueryClick = useCallback((index: number) => {
    messageAreaRef.current?.scrollToMessage(index);
    useQueryNavigatorStore.getState().setActiveQueryIndex(index);
  }, []);
  
  const getActiveQueryIndex = useCallback(() => {
    return useQueryNavigatorStore.getState().activeQueryIndex;
  }, []);
  
  return { 
    messageAreaRef, 
    handleQueryClick,
    handleActiveQueryIndexChange,
    getActiveQueryIndex,
    setActiveQueryIndex: useQueryNavigatorStore.getState().setActiveQueryIndex,
  };
}
