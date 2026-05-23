import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function QuartileBadge({ quartile }: { quartile?: string }) {
  if (!quartile) return null;

  const quartileMap: Record<string, { color: string; label: string }> = {
    Q1: { color: "bg-green-100 text-green-800", label: "Q1" },
    Q2: { color: "bg-yellow-100 text-yellow-800", label: "Q2" },
    Q3: { color: "bg-orange-100 text-orange-800", label: "Q3" },
    Q4: { color: "bg-red-100 text-red-800", label: "Q4" },
  };

  return (
    <Badge
      className={cn("font-semibold text-sm",
        quartileMap[quartile]?.color || "bg-gray-100 text-gray-800")}
    >
      {quartileMap[quartile]?.label || quartile}
    </Badge>
  );
}
