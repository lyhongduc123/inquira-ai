import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AuthorMetricCard } from "./AuthorMetricCard";
import {
  Bar,
  XAxis,
  YAxis,
  BarChart,
  CartesianGrid,
  LabelList,
} from "recharts";

interface CitationChartCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countsByYear?: Array<any>;
}

export function CitationChartCard({ countsByYear }: CitationChartCardProps) {
  const citationMetrics = countsByYear;
  const chartConfig = {
    year: {
      label: "Year",
    },
    cited_by_count: {
      label: "Citations",
    },
  } satisfies ChartConfig;
  return (
    <AuthorMetricCard title="CITATIONS OVER TIME">
      <ChartContainer
        config={chartConfig}
        className="w-full h-full min-h-[250px]"
      >
        <BarChart accessibilityLayer data={citationMetrics || []}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <YAxis allowDecimals={false} tickLine={false} />
          <XAxis dataKey={"year"} tickLine={false} />
          <Bar
            dataKey="cited_by_count"
            fill="var(--color-primary)"
            radius={[8, 8, 0, 0]}
          >
            <LabelList
              dataKey="cited_by_count"
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            />
          </Bar>
          <ChartTooltip
            content={<ChartTooltipContent hideIndicator hideLabel />}
          />
        </BarChart>
      </ChartContainer>
    </AuthorMetricCard>
  );
}
