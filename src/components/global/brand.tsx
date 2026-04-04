import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { HStack } from "../layout/hstack";
import Link from "next/link";

interface BrandProps {
  src?: string;
  alt?: string;
  size?: string;
  showText?: boolean;
  onClick?: () => void;
}

export function Brand({
  src = "/logo.svg",
  alt,
  size = "32px",
  showText = false,
  onClick,
}: BrandProps) {
  return (
    <HStack className="items-center" onClick={onClick}>
      <Avatar className="rounded-lg">
        <AvatarImage src={src} sizes={size} />
        <AvatarFallback>
          {alt ? alt.charAt(0).toUpperCase() : "E"}
        </AvatarFallback>
      </Avatar>
      {showText && (
        <Link href="/" className="ml-2 select-none text-lg font-bold">
          Exegent
        </Link>
      )}
    </HStack>
  );
}
