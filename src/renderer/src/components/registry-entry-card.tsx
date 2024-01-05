import React from 'react'
import { Card, Group, Image, Stack, Text } from '@mantine/core'
import { RegistryEntry } from '../schema/registryEntriesSchema'
import { useNavigate } from 'react-router-dom'

export type RegistryEntryCardProps = {
  entry: RegistryEntry
}
export const RegistryEntryCard: React.FC<RegistryEntryCardProps> = ({ entry }) => {
  const navigate = useNavigate()
  return (
    <Card
      p={0}
      shadow={'sm'}
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/library/${entry.id}`)}
    >
      <Stack gap={0} w={300} justify={'space-between'} h={300}>
        <Stack gap={0}>
          <Card.Section>
            <Image src={entry.preview} height={160} alt="preview" />
          </Card.Section>
          <Stack gap={0} pl={'md'} pr={'md'}>
            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500} maw={175} truncate>
                {entry.name}
              </Text>
            </Group>
            <Text size={'sm'} lineClamp={4} c={'dimmed'}>
              {entry.description}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}
