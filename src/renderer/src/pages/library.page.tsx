import React from 'react'
import { AppShell, Group, MultiSelect, Stack, TextInput, Title } from '@mantine/core'
import { VscSearch } from 'react-icons/vsc'
import { RegistryEntryCard } from '../components/registry-entry-card'
import { useFuse } from '../hooks/useFuse'
import { useGetRegistryIndex } from '../../../client'
import { useSettings } from '../context/settings.context'

export const LibraryPage: React.FC = () => {
  const settings = useSettings()
  const registry = useGetRegistryIndex({ axios: { baseURL: settings.registryUrl } })
  const { setSearch, results } = useFuse(registry.data?.data || [])

  const allAuthors = registry.data?.data.flatMap((it) =>
    it.authors.map((author) => {
      if (typeof author === 'string') {
        return { value: author, label: author }
      } else {
        return { value: author.name, label: author.name }
      }
    })
  )

  return (
    <Stack>
      <Title order={3}>Library</Title>
      <TextInput
        label={'Search'}
        leftSection={<VscSearch />}
        placeholder={'Search Mod Repository'}
        onBlur={(it) => setSearch(it.target.value)}
      />
      <Group>{results?.map((it) => <RegistryEntryCard key={it.id} item={it} />)}</Group>
      <AppShell.Aside>
        <Stack p={'md'}>
          <Title order={4} fw={500}>
            Filters
          </Title>
          <MultiSelect
            label={'Authors'}
            data={allAuthors}
            placeholder={"Filter by author's name"}
            clearable
            searchable
          />
        </Stack>
      </AppShell.Aside>
    </Stack>
  )
}
