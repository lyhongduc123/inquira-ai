import { Stack, StackProps } from "./stack"

export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="vertical" {...props} />
}
