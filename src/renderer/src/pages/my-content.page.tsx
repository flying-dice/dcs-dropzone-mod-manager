import React from 'react'
import { Stack, Title } from '@mantine/core'
import { Subscriptions } from '../container/subscriptions'

export const MyContentPage: React.FC = () => {
  return (
    <Stack>
      <Title order={3}>My Content</Title>
      <Subscriptions />
    </Stack>
  )
}
