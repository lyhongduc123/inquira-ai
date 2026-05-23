import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { OpacityShimmer } from "@/components/ui/opacity-shimmer";
import { Spinner } from "@/components/ui/spinner";

export function LoadingState() {
  return (
    <VStack className="flex-1 items-center justify-center">
      <HStack className="gap-2 items-center justify-center text-center">
        <Spinner />
        <OpacityShimmer>
          Loading messages...
        </OpacityShimmer>
      </HStack>
    </VStack>
  );
}
