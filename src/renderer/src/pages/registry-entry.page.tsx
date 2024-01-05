import React from 'react'
import {
  Alert,
  Anchor,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  Collapse,
  Divider,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Title,
  TypographyStylesProvider
} from '@mantine/core'
import { RegistryEntry } from '../schema/registryEntriesSchema'
import { useRegistryEntryContentProvider } from '../hooks/useRegistryEntryContentProvider'
import { useAsync, useAsyncFn } from 'react-use'
import { marked } from 'marked'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistry } from '../context/registry.context'
import { ReleaseSummary } from '../components/release-summary'
import { useDisclosure } from '@mantine/hooks'
import { AiOutlineStar } from 'react-icons/ai'

export const RegistryEntryPageLoader: React.FC = () => {
  const { id } = useParams()
  const registry = useRegistry()
  const entry = registry.entries.find((it) => it.id === id)
  return (
    <>
      {(entry && <RegistryEntryPage entry={entry} />) || (
        <Alert color={'red'}>Registry Entry with ID {id} not found</Alert>
      )}
    </>
  )
}

export type RegistryEntryPageProps = {
  entry: RegistryEntry
}
export const RegistryEntryPage: React.FC<RegistryEntryPageProps> = ({ entry }) => {
  const navigate = useNavigate()
  const [showAllReleases, allReleases] = useDisclosure(false)
  const contentProvider = useRegistryEntryContentProvider(entry)
  const [releases, fetchReleases] = useAsyncFn(
    async () => contentProvider.getReleases(),
    [contentProvider]
  )
  const meta = useAsync(() => contentProvider.getMeta(), [contentProvider])
  const readme = useAsync(() => contentProvider.getReadme(), [contentProvider])
  const latestRelease = useAsync(() => contentProvider.getLatestRelease(), [contentProvider])

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor size={'sm'} onClick={() => navigate('/library')}>
          Library
        </Anchor>
        <Anchor size={'sm'}>{entry.name}</Anchor>
      </Breadcrumbs>
      <LoadingOverlay visible={readme.loading || latestRelease.loading} />
      {readme.value && (
        <TypographyStylesProvider className={'readme'} pl={'xs'}>
          <div dangerouslySetInnerHTML={{ __html: marked.parse(readme.value) }} />
        </TypographyStylesProvider>
      )}
      <AppShell.Aside>
        <ScrollArea>
          <Stack p={'md'}>
            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                About
              </Title>
              <Text size={'sm'}>{meta.value?.description}</Text>
              {meta.value?.topics && (
                <Group gap={'xs'}>
                  {meta.value?.topics.map((it) => (
                    <Badge variant={'light'} key={it} size={'xs'}>
                      {it}
                    </Badge>
                  ))}
                </Group>
              )}

              {meta.value?.license && (
                <Text size={'sm'} c={'dimmed'}>
                  {meta.value?.license}
                </Text>
              )}

              <Button
                onClick={() => window.open(meta.value?.url, '_blank')}
                variant={'default'}
                leftSection={<AiOutlineStar />}
              >
                {meta.value?.stars} stars
              </Button>
            </Stack>

            <Stack gap={'xs'}>
              <Group justify={'space-between'}>
                <Title order={4} fw={500}>
                  Releases
                </Title>

                {!releases.value && (
                  <Button
                    variant={'subtle'}
                    size={'compact-xs'}
                    onClick={() => fetchReleases().then(allReleases.open)}
                    loading={releases.loading}
                  >
                    View All
                  </Button>
                )}
                {releases.value && (
                  <Button variant={'subtle'} size={'compact-xs'} onClick={allReleases.toggle}>
                    {showAllReleases ? 'Hide All' : 'View All'} ({releases.value?.length})
                  </Button>
                )}
              </Group>
              {latestRelease.value && <ReleaseSummary release={latestRelease.value} latest />}
              {releases.value && (
                <Collapse in={showAllReleases}>
                  {releases.value
                    .filter((it) => it.tag !== latestRelease.value?.tag)
                    .map((it) => (
                      <ReleaseSummary key={it.tag} release={it} />
                    ))}
                </Collapse>
              )}
            </Stack>

            <Divider color={'gray'} />

            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                Manage
              </Title>
              <Button size={'sm'} variant={'default'}>
                Install
              </Button>
            </Stack>
          </Stack>
        </ScrollArea>
      </AppShell.Aside>
    </Stack>
  )
}
