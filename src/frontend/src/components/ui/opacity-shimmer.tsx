import { clsx } from "clsx";
import React from "react";

interface OpacityShimmerProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function OpacityShimmer({
  children,
  className,
  ...props
}: OpacityShimmerProps) {
  return (
    <span
      className={clsx(
        "inline-block",
        "[-webkit-mask-image:linear-gradient(110deg,rgba(0,0,0,0.7)_45%,#000_50%,rgba(0,0,0,0.7)_55%)]",
        "[-webkit-mask-size:200%_auto]",
        "animate-mask-shimmer",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}