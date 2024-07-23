import React, { useMemo } from 'react'
import { Alert, Group, LoadingOverlay, Stack, Text, TextInput, Title } from '@mantine/core'
import { VscSearch, VscWarning } from 'react-icons/vsc'
import { RegistryEntryCard } from '../components/registry-entry-card'
import { useFuse } from '../hooks/useFuse'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { CodeHighlight } from '@mantine/code-highlight'
import { stringify } from 'yaml'
import { pick } from 'lodash'
import { Collapsible } from '../components/collapsible'
import { useRegistry } from '../hooks/useRegistry'

export const LibraryPage: React.FC = () => {
  const registry = useRegistry()
  const subscribed = useSubscriptions()
  const { setSearch, results } = useFuse(registry.index.data?.data || [])

  const subscribedIds = useMemo(() => subscribed.data?.map((it) => it.modId), [subscribed.data])

  return (
    <Stack>
      <LoadingOverlay visible={registry.url.isLoading || registry.index.isLoading} />
      <Title order={3}>Library</Title>
      <TextInput
        label={'Search'}
        leftSection={<VscSearch />}
        placeholder={'Search Mod Repository'}
        onChange={(it) => setSearch(it.target.value)}
      />
      <Group>
        {results?.map((it) => (
          <RegistryEntryCard key={it.id} item={it} subscribed={subscribedIds?.includes(it.id)} />
        ))}
      </Group>

      {!registry.url.isLoading && !registry.index.isLoading && registry.index.error && (
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
      )}
    </Stack>
  )
}
