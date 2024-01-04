import React from 'react'
import { Group, Stack, TextInput, Title } from '@mantine/core'
import { VscSearch } from 'react-icons/vsc'
import { Registry } from '../schema/registry.schema'
import { RegistryEntryCard } from '../components/registry-entry-card'
import { useFuse } from '../hooks/useFuse'

export type LibraryPageProps = {
  registry: Registry
}
export const LibraryPage: React.FC<LibraryPageProps> = ({ registry }) => {
  const { setSearch, results } = useFuse(registry)

  return (
    <Stack>
      <Title order={3}>Library</Title>
      <TextInput
        label={'Search'}
        leftSection={<VscSearch />}
        placeholder={'Search Mod Repository'}
        onBlur={(it) => setSearch(it.target.value)}
      />
      <Group>{results?.map((entry) => <RegistryEntryCard key={entry.url} entry={entry} />)}</Group>
    </Stack>
  )
}
