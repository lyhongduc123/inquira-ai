import { TypographyH1, TypographyH2, TypographyH3, TypographyH4 } from "@/components/global/typography";
import { Box } from "@/components/layout/box";

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <Box className="w-fit rounded-xl bg-secondary/80 dark:bg-primary/80 px-4 py-2">
      <TypographyH4>
        {text}
      </TypographyH4>
    </Box>
  );
}
