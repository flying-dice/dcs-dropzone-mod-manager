import React from 'react'
import { Card, Group, Image, Indicator, Stack, Text } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { RegistryIndexItem } from '../../../client'
import { useSettings } from '../context/settings.context'

export type RegistryEntryCardProps = {
  item: RegistryIndexItem
  installed: boolean
}
export const RegistryEntryCard: React.FC<RegistryEntryCardProps> = ({ item, installed }) => {
  const settings = useSettings()
  const navigate = useNavigate()
  return (
    <Indicator
      inline
      label="Installed"
      position="top-center"
      size={22}
      disabled={!installed}
      withBorder
    >
      <Card
        p={0}
        shadow={'sm'}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/library/${item.id}`)}
      >
        <Stack gap={0} w={300} justify={'space-between'} h={300}>
          <Stack gap={0}>
            <Card.Section>
              <Image src={`${settings.registryUrl}/${item.imageUrl}`} height={160} alt="preview" />
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
