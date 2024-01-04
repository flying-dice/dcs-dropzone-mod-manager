import React from 'react'
import { Badge, Button, Card, Group, Image, Stack, Text } from '@mantine/core'
import { RegistryEntry } from '../schema/registry.schema'
import { openRegistryEntryModal } from '../modals/registry-entry.modal'

export type RegistryEntryCardProps = {
  entry: RegistryEntry
}
export const RegistryEntryCard: React.FC<RegistryEntryCardProps> = ({ entry }) => {
  return (
    <Card p={0}>
      <Stack gap={0} w={300} justify={'space-between'} h={400}>
        <Stack gap={0}>
          <Card.Section>
            <Image src={entry.preview} height={160} alt="preview" />
          </Card.Section>
          <Stack gap={0} pl={'md'} pr={'md'}>
            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500} maw={175} truncate>
                {entry.name}
              </Text>
              <Badge size={'sm'} color="pink">
                Featured
              </Badge>
            </Group>
            <Text size={'xs'} lineClamp={6} c={'dimmed'}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </Text>
          </Stack>
        </Stack>
        <Stack p={'md'}>
          <Button color="blue" onClick={() => openRegistryEntryModal(entry)}>
            View
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
