import { useState, useLayoutEffect, useCallback, RefObject } from "react";

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

const GAP = 8;

export function useCitationPosition(
  triggerRef: RefObject<HTMLElement | null>,
  cardRef: RefObject<HTMLElement | null>,
  isOpen: boolean
): Position {
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  const calculatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const card = cardRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Use actual card dimensions if available, otherwise use defaults
    const cardWidth = card ? card.offsetWidth : 400;
    const cardHeight = card ? card.offsetHeight : 300;

    const vertical = calculateVerticalPosition(rect, vh, cardHeight);
    const horizontal = calculateHorizontalPosition(rect, vw, cardWidth);

    setPosition({
      top: vertical.top,
      left: horizontal,
      placement: vertical.placement,
    });
  }, [triggerRef, cardRef]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    let frame: number;

    const onUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(calculatePosition);
    };

    calculatePosition();

    window.addEventListener("scroll", onUpdate, true);
    window.addEventListener("resize", onUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onUpdate, true);
      window.removeEventListener("resize", onUpdate);
    };
  }, [isOpen, calculatePosition]);

  return position;
}

function calculateVerticalPosition(
  rect: DOMRect,
  vh: number,
  cardHeight: number
): { top: number; placement: "top" | "bottom" } {
  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;

  const fitsBelow = spaceBelow >= cardHeight + GAP;
  const fitsAbove = spaceAbove >= cardHeight + GAP;

  if (fitsBelow) {
    // Position below the trigger
    return { top: rect.bottom + GAP, placement: "bottom" };
  }

  if (fitsAbove) {
    // Position above the trigger
    return { top: rect.top - cardHeight - GAP, placement: "top" };
  }

  // When both sides are cramped, choose the side with more space
  if (spaceBelow >= spaceAbove) {
    return { top: rect.bottom + GAP, placement: "bottom" };
  }

  return { top: rect.top - cardHeight - GAP, placement: "top" };
}

function calculateHorizontalPosition(rect: DOMRect, vw: number, cardWidth: number): number {
  // Calculate center position relative to the citation trigger
  const triggerCenter = rect.left + rect.width / 2;
  const cardCenterOffset = cardWidth / 2;
  const idealLeft = triggerCenter - cardCenterOffset;

  // Check if centered position fits within viewport with gap
  const fitsLeft = idealLeft >= GAP;
  const fitsRight = idealLeft + cardWidth <= vw - GAP;

  // If centered position fits, use it
  if (fitsLeft && fitsRight) {
    return idealLeft;
  }

  // If card would overflow on the right, align to right edge
  if (!fitsRight) {
    return vw - cardWidth - GAP;
  }

  // If card would overflow on the left, align to left edge
  if (!fitsLeft) {
    return GAP;
  }

  // Fallback to left edge (shouldn't normally reach here)
  return GAP;
}
