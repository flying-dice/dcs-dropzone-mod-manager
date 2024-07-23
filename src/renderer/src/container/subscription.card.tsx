import React from 'react'
import { Card, Group, Text, Title } from '@mantine/core'

export type SubscriptionCardProps = {
  id: string
  name: string
  version: string
  onClick?: () => void
}
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  id,
  name,
  version,
  onClick
}) => {
  return (
    <Card key={id} withBorder>
      <Group justify={'space-between'}>
        <Group>
          <Title style={{ cursor: 'pointer' }} onClick={onClick} order={5}>
            {name}
          </Title>
        </Group>
        <Group gap={'xs'}>
          <Text>{version}</Text>
        </Group>
      </Group>
    </Card>
  )
}
