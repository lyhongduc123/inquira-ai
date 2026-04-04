import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      between: 'justify-between',
      end: 'justify-end',
    },
  },
  defaultVariants: {
    direction: 'vertical',
  },
})

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}


export function Stack({
  className,
  direction,
  align,
  justify,
  ...props
}: StackProps) {
  return (
    <div
      className={clsx(
        stackVariants({ direction, align, justify }),
        className
      )}
      {...props}
    />
  )
}
