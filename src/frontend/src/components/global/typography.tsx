import { cva, VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

// Typography variants
const headingVariants = cva("scroll-m-20", {
  variants: {
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      accent: "text-accent-foreground",
    },
    size: {
      xs: "text-base",
      sm: "text-lg",
      base: "text-xl",
      lg: "text-2xl",
      xl: "text-3xl",
      "2xl": "text-4xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "default",
    weight: "semibold",
  },
});

const paragraphVariants = cva("", {
  variants: {
    variant: {
      default: "text-inherit",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      black: "text-black",
      white: "text-white",
      accent: "text-accent",
      destructive: "text-destructive",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    leading: {
      none: "leading-none",
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    },
    onHoverChange: {
      true: "transition-colors",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "default",
      onHoverChange: true,
      class: "hover:text-accent-foreground group-hover/item:text-accent-foreground",
    },
    {
      variant: "muted",
      onHoverChange: true,
      class: "hover:text-foreground group-hover:text-foreground",
    },
    {
      variant: "primary",
      onHoverChange: true,
      class: "hover:text-primary/80 group-hover:text-primary/80",
    },
    {
      variant: "destructive",
      onHoverChange: true,
      class: "hover:text-destructive/80 group-hover:text-destructive/80",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "base",
    weight: "normal",
    leading: "normal",
  },
});

interface TypographyH1Props
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

interface TypographyH2Props
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

interface TypographyH3Props
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

interface TypographyH4Props
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

interface TypographyPProps
  extends
    React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {}

export function TypographyH1({
  children,
  className = "",
  variant,
  size = "xl",
  weight = "semibold",
  ...props
}: TypographyH1Props) {
  return (
    <h1
      className={clsx(
        headingVariants({ variant, size, weight }),
        "leading-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function TypographyH2({
  children,
  className = "",
  variant,
  size = "lg",
  weight = "semibold",
  ...props
}: TypographyH2Props) {
  return (
    <h2
      className={clsx(
        headingVariants({ variant, size, weight }),
        "leading-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function TypographyH3({
  children,
  className = "",
  variant,
  size = "base",
  weight = "semibold",
  ...props
}: TypographyH3Props) {
  return (
    <h3
      className={clsx(
        headingVariants({ variant, size, weight }),
        "leading-snug",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function TypographyH4({
  children,
  className = "",
  variant,
  size = "sm",
  weight = "semibold",
  ...props
}: TypographyH4Props) {
  return (
    <h4
      className={clsx(
        headingVariants({ variant, size, weight }),
        "leading-snug",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

export function TypographyP({
  children,
  className = "",
  variant,
  size,
  weight,
  align,
  leading,
  ...props
}: TypographyPProps) {
  return (
    <p
      className={clsx(
        paragraphVariants({ variant, size, weight, align, leading }),
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
