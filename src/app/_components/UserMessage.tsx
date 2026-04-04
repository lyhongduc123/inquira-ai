import { TypographyH1, TypographyH2, TypographyH3 } from "@/components/global/typography";
import { Box } from "@/components/layout/box";

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <Box className="w-full">
      <TypographyH3>
        {text}
      </TypographyH3>
    </Box>
  );
}
