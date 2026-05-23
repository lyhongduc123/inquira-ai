import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthorMetricCardProps {
  title?: string;
  children?: React.ReactNode;
}

export function AuthorMetricCard({ title, children }: AuthorMetricCardProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      {children}
    </Card>
  );
}

export function AuthorMetricCardContent({
  children,
  ...props
}: {
  children?: React.ReactNode;
} & React.ComponentProps<typeof CardContent>) {
  return <CardContent {...props}>{children}</CardContent>;
}

export function AuthorMetricCardFooter({
  children,
  ...props
}: {
  children?: React.ReactNode;
} & React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter className="flex-col items-start gap-2 text-sm" {...props}>
      {children}
    </CardFooter>
  );
}
