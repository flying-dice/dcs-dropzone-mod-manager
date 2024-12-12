import { Card, Group, Image, Indicator, Stack, Text } from '@mantine/core'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RegistryIndexItem } from '../../../lib/client'
import { useRegistryUrl } from '../hooks/useRegistryUrl'

export type RegistryEntryCardProps = {
  item: RegistryIndexItem
  subscribed?: boolean
}
export const RegistryEntryCard: React.FC<RegistryEntryCardProps> = ({ item, subscribed }) => {
  const url = useRegistryUrl()

  const navigate = useNavigate()
  return (
    <Indicator
      inline
      label="Subscribed"
      position="top-center"
      size={22}
      disabled={!subscribed}
      withBorder
    >
      <Card
        p={0}
        shadow={'sm'}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/library/${item.id}`)}
      >
        <Stack gap={0} w={300} justify={'space-between'} h={350}>
          <Stack gap={0}>
            <Card.Section>
              {url.data && (
                <Image src={`${url.data}/${item.imageUrl}`} height={190} alt="preview" />
              )}
            </Card.Section>
            <Stack gap={0} pl={'md'} pr={'md'}>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500} maw={175} truncate>
                  {item.name}
                </Text>
              </Group>
              <Text size={'sm'} lineClamp={4} c={'dimmed'}>
                {item.description}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Indicator>
  )
}
