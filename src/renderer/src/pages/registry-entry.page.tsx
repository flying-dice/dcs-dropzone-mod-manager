import React from 'react'
import {
  Alert,
  Anchor,
  AppShell,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
  TypographyStylesProvider
} from '@mantine/core'
import { marked } from 'marked'
import { useNavigate, useParams } from 'react-router-dom'
import { ReleaseSummary } from '../components/release-summary'
import { EntryIndex, EntryLatestRelease } from '../../../lib/client'
import { MdOutlineCategory } from 'react-icons/md'
import { VscCheck, VscClose } from 'react-icons/vsc'
import { useDisclosure } from '@mantine/hooks'
import { useRegistrySubscriber } from '../hooks/useRegistrySubscriber'
import { useRegistryEntry } from '../hooks/useRegistryEntry'

export const RegistryEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { index, latestRelease } = useRegistryEntry(id || '')

  return (
    <>
      <LoadingOverlay visible={index.isLoading || latestRelease.isLoading} />
      {index.data?.data && latestRelease.data?.data && (
        <_RegistryEntryPage entry={index.data.data} latestRelease={latestRelease.data?.data} />
      )}
      {index.isLoading && index.error && (
        <Alert color={'red'}>Registry Entry with ID {id} not found</Alert>
      )}
      {latestRelease.isLoading && latestRelease.error && (
        <Alert color={'red'}>Unable to find latest release for registry Entry with ID {id}</Alert>
      )}
    </>
  )
}

export type RegistryEntryPageProps = {
  entry: EntryIndex
  latestRelease?: EntryLatestRelease
}
export const _RegistryEntryPage: React.FC<RegistryEntryPageProps> = ({ entry, latestRelease }) => {
  const navigate = useNavigate()
  const registrySubscriber = useRegistrySubscriber(entry)
  const [isMouseOver, mouseOver] = useDisclosure(false)

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor size={'sm'} onClick={() => navigate('/library')}>
          Library
        </Anchor>
        <Anchor size={'sm'}>{entry.name}</Anchor>
      </Breadcrumbs>
      <TypographyStylesProvider className={'readme'} pl={'xs'}>
        <div dangerouslySetInnerHTML={{ __html: marked.parse(atob(entry.content)) }} />
      </TypographyStylesProvider>
      <AppShell.Aside>
        <ScrollArea>
          <Stack p={'md'}>
            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                About
              </Title>
              <TextInput
                readOnly
                variant={'unstyled'}
                leftSection={<MdOutlineCategory />}
                value={entry.category}
              />
              <Textarea
                readOnly
                variant={'unstyled'}
                autosize
                size={'sm'}
                value={entry.description}
              />
              <Group gap={'xs'}>
                {entry.tags.map((it) => (
                  <Badge variant={'light'} key={it} size={'sm'}>
                    {it}
                  </Badge>
                ))}
              </Group>

              <Text size={'sm'} c={'dimmed'}>
                {entry.license}
              </Text>
            </Stack>

            <Stack gap={'xs'}>
              {registrySubscriber.isSubscribed ? (
                <Button
                  size={'sm'}
                  variant={'default'}
                  onClick={() => registrySubscriber.unsubscribe()}
                  leftSection={isMouseOver ? <VscClose /> : <VscCheck />}
                  onMouseEnter={mouseOver.open}
                  onMouseLeave={mouseOver.close}
                >
                  {isMouseOver ? 'Unsubscribe' : 'Subscribed'}
                </Button>
              ) : (
                <Button
                  size={'sm'}
                  variant={'default'}
                  onClick={() => registrySubscriber.subscribe()}
                >
                  Subscribe
                </Button>
              )}
            </Stack>

            <Divider color={'gray'} />

            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                Authors
              </Title>
              <AvatarGroup>
                {entry.authors.map((it) => (
                  <Tooltip key={it.name} label={it.name}>
                    <Avatar src={it.url} alt={it.name}>
                      {it.name.slice(0, 2)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Stack>

            <Divider color={'gray'} />

            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                Links
              </Title>
              <Anchor href={entry.homepage} target={'_blank'}>
                Homepage
              </Anchor>
            </Stack>

            <Divider color={'gray'} />

            <Stack gap={'xs'}>
              <Group justify={'space-between'}>
                <Title order={4} fw={500}>
                  Releases
                </Title>
              </Group>
              {latestRelease ? (
                <ReleaseSummary release={latestRelease} latest />
              ) : (
                <Text>No Release Found</Text>
              )}
            </Stack>
          </Stack>
        </ScrollArea>
      </AppShell.Aside>
    </Stack>
  )
}
