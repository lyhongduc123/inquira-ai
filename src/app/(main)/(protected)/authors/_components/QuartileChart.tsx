import { QuartileBreakdownDTO } from "@/types/author.type";
import { VStack } from "@/components/layout/vstack";
import { HStack } from "@/components/layout/hstack";
import { Label } from "@/components/ui/label";
import { TypographyP } from "@/components/global/typography";
import { AuthorMetricCard, AuthorMetricCardContent } from "./AuthorMetricCard";

interface QuartileChartProps {
  quartileBreakdown: QuartileBreakdownDTO;
}

export function QuartileChart({ quartileBreakdown }: QuartileChartProps) {
  const total = Object.values(quartileBreakdown).reduce(
    (sum, val) => sum + val,
    0,
  );

  const quartiles = [
    { label: "Q1", count: quartileBreakdown.q1, color: "bg-green-500" },
    { label: "Q2", count: quartileBreakdown.q2, color: "bg-blue-500" },
    { label: "Q3", count: quartileBreakdown.q3, color: "bg-yellow-500" },
    { label: "Q4", count: quartileBreakdown.q4, color: "bg-orange-500" },
    {
      label: "Unknown",
      count: quartileBreakdown.unknown,
      color: "bg-gray-400",
    },
  ];

  return (
    <AuthorMetricCard title="QUARTILE BREAKDOWN">
      <AuthorMetricCardContent>
        <VStack className="gap-6">
          <HStack className="h-12 w-full rounded-lg overflow-hidden shadow-inner border-2">
            {quartiles.map((q) => {
              const percentage = total > 0 ? (q.count / total) * 100 : 0;
              return percentage > 0 ? (
                <div
                  key={q.label}
                  className={`${q.color} h-full flex items-center justify-center text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer relative group`}
                  style={{ width: `${percentage}%` }}
                  title={`${q.label}: ${q.count} papers (${percentage.toFixed(1)}%)`}
                >
                  <span className="drop-shadow-md">
                    {percentage.toFixed(1)}%
                  </span>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {q.count} papers
                  </div>
                </div>
              ) : null;
            })}
          </HStack>

          <VStack className="gap-2">
            {quartiles.map((q) => {
              const percentage = total > 0 ? (q.count / total) * 100 : 0;
              return q.count > 0 ? (
                <HStack
                  key={q.label}
                  className="gap-3 items-center justify-between"
                >
                  <HStack className="gap-2 items-center">
                    <div className={`h-3 w-3 rounded-sm ${q.color}`} />
                    <Label className="text-sm font-medium">{q.label}</Label>
                  </HStack>
                  <TypographyP size="sm" variant="muted">
                    {q.count} ({percentage.toFixed(1)}%)
                  </TypographyP>
                </HStack>
              ) : null;
            })}
          </VStack>
        </VStack>
      </AuthorMetricCardContent>
    </AuthorMetricCard>
  );
}
