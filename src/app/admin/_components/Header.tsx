import { TypographyH2 } from "@/components/global/typography";
import { HStack } from "@/components/layout/hstack";

interface HeaderProps {
  title: string;
}

export function Header(props: HeaderProps) {
  const { title } = props;
  return (
    <HStack>
      <TypographyH2>{title}</TypographyH2>
    </HStack>
  );
}
