import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FileExclamationPointIcon } from "lucide-react";

export default function PaperNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <FileExclamationPointIcon className="size-16 text-destructive" />
        </EmptyMedia>
        <EmptyTitle>404 Paper not found.</EmptyTitle>
        <EmptyDescription>
          The paper you are looking for does not exist or has been removed.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
}
