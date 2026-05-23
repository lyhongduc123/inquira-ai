import { Badge } from "@/components/ui/badge";

export const IndexBadge = ({
  idx,
  isSelected,
}: {
  idx?: number;
  isSelected?: boolean;
}) => {
  if (idx === undefined) return null;
  return (
    <Badge
      className={
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }
    >
      {idx + 1}
    </Badge>
  );
};
