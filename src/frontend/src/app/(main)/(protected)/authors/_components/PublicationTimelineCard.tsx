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
import {
  AuthorMetricCard,
  AuthorMetricCardContent,
  AuthorMetricCardFooter,
} from "./AuthorMetricCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";

interface PublicationTimelineProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countsByYear: Record<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openalexCountsByYear?: Record<any, any>;
}

export function PublicationChartCard({
  countsByYear,
  openalexCountsByYear,
}: PublicationTimelineProps) {
  const [source, setSource] = useState<"internal" | "openalex">("internal");
  const years = Object.keys(countsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  const openAlexYears = openalexCountsByYear
    ? Object.keys(openalexCountsByYear)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  if (years.length === 0) {
    return null;
  }

  const chartData = years.map((year) => ({
    year,
    publication_count: countsByYear[year]?.papers || 0,
  }));
  const openAlexChartData = openAlexYears.map((year) => ({
    year,
    publication_count: openalexCountsByYear
      ? openalexCountsByYear[year].papers || 0
      : 0,
  }));

  const chartConfig = {
    year: {
      label: "Year",
    },
    publication_count: {
      label: "Publications",
    },
  } satisfies ChartConfig;

  const rchartData = source === "internal" ? chartData : openAlexChartData;

  const shouldShowLabels = rchartData.length <= 8;
  return (
    <AuthorMetricCard title="YEARLY PUBLICATIONS">
      <AuthorMetricCardContent>
        <ChartContainer
          className="w-full h-64 min-h-[200px]"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={source === "internal" ? chartData : openAlexChartData}
          >
            <CartesianGrid vertical={false} opacity={1} />
            <XAxis dataKey={"year"} tickLine={true} />
            <Bar
              dataKey="publication_count"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            >
              {shouldShowLabels && (
                <LabelList
                  dataKey="publication_count"
                  position="top"
                  offset={8}
                  className="fill-black dark:fill-white"
                  fontSize={11}
                  fontWeight={600}
                />
              )}
            </Bar>
            <ChartTooltip
              content={<ChartTooltipContent hideIndicator hideLabel />}
            />
          </BarChart>
        </ChartContainer>
      </AuthorMetricCardContent>
      <AuthorMetricCardFooter>
        <HStack className="flex gap-2 mb-4">
          <Button
            variant={source === "internal" ? "default" : "outline"}
            onClick={() => setSource("internal")}
          >
            Indexed
          </Button>
          <Button
            variant={source === "openalex" ? "default" : "outline"}
            onClick={() => setSource("openalex")}
          >
            OpenAlex
          </Button>
        </HStack>
        {source === "openalex" && (
          <Alert variant="info" className="w-full">
            <InfoIcon className="size-4" />
            <AlertTitle>Data by OpenAlex</AlertTitle>
          </Alert>
        )}
      </AuthorMetricCardFooter>
    </AuthorMetricCard>
  );
}
