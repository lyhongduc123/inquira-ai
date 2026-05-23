import { AuthorDetailWithPapersDTO } from "@/types/author.type";
import { HStack } from "@/components/layout/hstack";
import { VStack } from "@/components/layout/vstack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
} from "@/components/global/typography";
import { Award, BookOpen, Quote, TrendingUp } from "lucide-react";
import { Box } from "@/components/layout/box";
import { Item } from "@/components/ui/item";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { AuthorMetricCard } from "./AuthorMetricCard";

interface AuthorMetricsCardsProps {
  author?: AuthorDetailWithPapersDTO;
}

export function AuthorMetricsSection({ author }: AuthorMetricsCardsProps) {
  const metrics = [
    {
      title: "h-index",
      value: author?.hIndex || 0,
      description: "Research impact metric",
    },
    {
      title: "i10-index",
      value: author?.i10Index || 0,
      description: "Papers with 10+ citations",
    },
    {
      title: "Total citations",
      value: (author?.totalCitations || 0).toLocaleString(),
      description: "Times cited by others",
    },
    {
      title: "Publications",
      value: author?.totalPapers || 0,
      description: "Total papers published",
    },
  ];

  return (
    <Box>
      <VStack className="gap-6">
        <Card className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {metrics.map((metric) => (
            <CardContent
              key={metric.title}
            >
              <HStack className="items-start justify-between">
                <VStack className="gap-1 flex-1">
                  <TypographyH2 className="font-bold">
                    {metric.value}
                  </TypographyH2>
                  <TypographyP
                    size="sm"
                    variant="muted"
                    className="font-semibold"
                  >
                    {metric.title.toUpperCase()}
                  </TypographyP>
                </VStack>
              </HStack>
            </CardContent>
          ))}
        </Card>
      </VStack>
    </Box>
  );
}
