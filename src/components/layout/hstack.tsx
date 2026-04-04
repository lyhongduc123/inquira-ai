import { Stack, StackProps } from "./stack"

export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="horizontal" {...props} />
}