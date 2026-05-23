import { TypographyP } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";
import { cn } from "@/lib/utils";

interface InfoItemProps {
  icon?: React.ReactNode;
  label?: string;
  number?: number | string;
  className?: string;
  labelClassName?: string;
}

export const InfoItem = ({ icon, label, number, className, labelClassName = "truncate" }: InfoItemProps) => {
  if (!icon && !label && !number) return null;
  return (
    <HStack className={cn("items-center gap-1 min-w-0", className)}>
      {icon}
      {number !== undefined && number !== null && (
        <span className="font-semibold shrink-0 text-xs">
          {number}
        </span>
      )}
      {label && (
        <span className={cn("text-muted-foreground text-xs", labelClassName)}>
          {" " + label}
        </span>
      )}
    </HStack>
  );
};