import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Users } from "lucide-react";
import Link from "next/link";

export default function AuthorNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Users className="h-12 w-12 text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Author Not Found</EmptyTitle>
        <EmptyDescription>
          The author you are looking for does not exist or has been removed.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/authors">
          <Button variant="outline">Back to Authors List</Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
