import React from 'react'
import { Stack, Title } from '@mantine/core'

export type HomePageProps = {}
export const HomePage: React.FC<HomePageProps> = ({}) => {
  return (
    <Stack>
      <Title order={3}>Home</Title>
    </Stack>
  )
}
