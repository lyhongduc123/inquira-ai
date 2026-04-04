import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Spinner } from "@/components/ui/spinner";

export function LoadingState() {
  return (
    <VStack className="flex-1 items-center justify-center">
      <HStack className="gap-2 text-center">
        <Spinner />
        <TypographyP variant="muted" size="sm">
          Loading messages...
        </TypographyP>
      </HStack>
    </VStack>
  );
}
