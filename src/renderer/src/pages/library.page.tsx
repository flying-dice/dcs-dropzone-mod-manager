import { CodeHighlight } from '@mantine/code-highlight'
import { Alert, Group, Stack, Text, TextInput, Title } from '@mantine/core'
import { pick } from 'lodash'
import React from 'react'
import { useMemo } from 'react'
import { VscSearch, VscWarning } from 'react-icons/vsc'
import { stringify } from 'yaml'
import { Collapsible } from '../components/collapsible'
import { RegistryEntryCard } from '../components/registry-entry-card'
import { useFuse } from '../hooks/useFuse'
import { useRegistryIndex } from '../hooks/useRegistryIndex'
import { useSubscriptions } from '../hooks/useSubscriptions'

export const LibraryPage: React.FC = () => {
  const registry = useRegistryIndex()
  const subscribed = useSubscriptions()
  const { setSearch, results } = useFuse(registry.index.data?.data || [])

  const subscribedIds = useMemo(() => subscribed.data?.map((it) => it.modId), [subscribed.data])

  return (
    <Stack>
      <Title order={3}>Library</Title>
      <TextInput
        label={'Search'}
        leftSection={<VscSearch />}
        placeholder={'Search Mod Repository'}
        onChange={(it) => setSearch(it.target.value)}
        pb={'lg'}
      />

      {registry.index.error ? (
        <Alert icon={<VscWarning />} color={'red'} title={'Failed to get library content'}>
          <Stack gap={0}>
            <Text>An error occurred while fetching the library content from the registry.</Text>
            <Collapsible
              labels={{ expand: 'Details', collapse: 'Details' }}
              _props={{ button: { color: 'default' } }}
            >
              <CodeHighlight
                language={'yaml'}
                code={stringify(
                  pick(registry.index.error, ['name', 'message', 'config.baseURL', 'config.url'])
                )}
              />
            </Collapsible>
          </Stack>
        </Alert>
      ) : (
        <Group>
          {results?.map((it) => (
            <RegistryEntryCard key={it.id} item={it} subscribed={subscribedIds?.includes(it.id)} />
          ))}
        </Group>
      )}
    </Stack>
  )
}
