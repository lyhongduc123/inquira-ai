import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthorMetricCardProps {
  title?: string;
  children?: React.ReactNode;
}

export function AuthorMetricCard({title, children, }: AuthorMetricCardProps) {
  return (
    <Card className="border-0 bg-background">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
