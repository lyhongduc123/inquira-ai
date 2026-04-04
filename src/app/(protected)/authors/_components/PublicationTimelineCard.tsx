import { Box } from "@/components/layout/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  XAxis,
  YAxis,
  BarChart,
  CartesianGrid,
  LabelList,
} from "recharts";
import { AuthorMetricCard } from "./AuthorMetricCard";

interface PublicationTimelineProps {
  papersByYear: Record<number, number>;
}

export function PublicationTimeline({
  papersByYear,
}: PublicationTimelineProps) {
  const years = Object.keys(papersByYear)
    .map(Number)
    .sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(papersByYear));

  if (years.length === 0) {
    return null;
  }

  const chartData = years.map((year) => ({
    year,
    publication_count: papersByYear[year] || 0,
  }));
  const chartConfig = {
    year: {
      label: "Year",
    },
    publication_count: {
      label: "Publications",
    },
  } satisfies ChartConfig;

  return (
    <AuthorMetricCard title="PUBLICATION TIMELINE">
      <ChartContainer
        className="w-full h-64 min-h-[200px]"
        config={chartConfig}
      >
        <BarChart accessibilityLayer data={chartData || []}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <YAxis allowDecimals={false} tickLine={true} />
          <XAxis dataKey={"year"} tickLine={true} />
          <Bar
            dataKey="publication_count"
            fill="var(--color-primary)"
            radius={[8, 8, 0, 0]}
          >
            <LabelList
              dataKey="publication_count"
              position="top"
              offset={8}
              className="fill-white"
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
