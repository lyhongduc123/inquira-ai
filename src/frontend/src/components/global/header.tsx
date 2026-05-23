"use client";

import { HStack } from "../layout/hstack";
import { Box } from "../layout/box";

interface HeaderProps {
  children?: React.ReactNode;
  middleContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function Header({
  children,
  middleContent,
  leftContent,
  rightContent,
}: HeaderProps) {
  return (
    <HStack className="items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 gap-4 max-h-[57px]">
      <HStack className="items-center gap-2 shrink-0">
        {children}
        {leftContent}
      </HStack>
      {middleContent && (
        <Box className="flex-1 flex items-center justify-center max-w-2xl mx-auto">
          {middleContent}
        </Box>
      )}

      <HStack className="items-center gap-2 shrink-0">
        {rightContent}
      </HStack>
    </HStack>
  );
}
