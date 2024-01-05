import React from 'react'
import { AppShell, Group, MultiSelect, Stack, TextInput, Title } from '@mantine/core'
import { VscSearch } from 'react-icons/vsc'
import { RegistryEntryCard } from '../components/registry-entry-card'
import { useFuse } from '../hooks/useFuse'
import { useRegistry } from '../context/registry.context'

export const LibraryPage: React.FC = () => {
  const registry = useRegistry()
  const { setSearch, results } = useFuse(registry.entries)

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
      <AppShell.Aside>
        <Stack p={'md'}>
          <Title order={4} fw={500}>
            Filters
          </Title>
          <MultiSelect
            label={'Authors'}
            data={registry.entries.map((it) => ({ value: it.author, label: it.author }))}
            placeholder={"Filter by author's name"}
            clearable
            searchable
          />
        </Stack>
      </AppShell.Aside>
    </Stack>
  )
}
