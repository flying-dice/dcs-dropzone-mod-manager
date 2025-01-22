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
  TypographyStylesProvider,
  Image,
  Center
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { marked } from 'marked'
import React, { useEffect } from 'react'
import { MdOutlineCategory } from 'react-icons/md'
import { VscCheck, VscClose } from 'react-icons/vsc'
import { useNavigate, useParams } from 'react-router-dom'
import { EntryIndex } from '../../../lib/client'
import { ReleaseSummary } from '../components/release-summary'
import { useRegistrySubscriber } from '../hooks/useRegistrySubscriber'
import { useRegistryEntry } from '../hooks/useRegistryEntry'
import { showNotification } from '@mantine/notifications'
import { useAsync } from 'react-use'
import { client } from '@renderer/client'
import { chunks } from '@renderer/utils/arrays'

export const RegistryEntryPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { index } = useRegistryEntry(id!)

  useEffect(() => {
    if (typeof index.data === 'string') {
      showNotification({
        color: 'red',
        title: 'Error',
        message: `Registry Entry with ID ${id} not found`
      })
      navigate('/library')
    }
  }, [id, index.data])

  return (
    <>
      {index.error && <Alert color={'red'}>{index.error.message}</Alert>}
      <LoadingOverlay visible={index.isLoading} />
      {typeof index.data !== 'string' && typeof index.data !== 'undefined' && (
        <_RegistryEntryPage entry={index.data} />
      )}
      {!index.isLoading && index.error && (
        <Alert color={'red'}>Registry Entry with ID {id} not found</Alert>
      )}
    </>
  )
}

export type RegistryEntryPageProps = {
  entry: EntryIndex
}
export const _RegistryEntryPage: React.FC<RegistryEntryPageProps> = ({ entry }) => {
  const navigate = useNavigate()
  const registrySubscriber = useRegistrySubscriber(entry)
  const [isMouseOver, mouseOver] = useDisclosure(false)

  const latestRelease = entry.versions.find((it) => it.version === entry.latest)
  const url = useAsync(() => client.getRegistryUrl.query(), [])

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor size={'sm'} onClick={() => navigate('/library')}>
          Library
        </Anchor>
        <Anchor size={'sm'}>{entry.name}</Anchor>
      </Breadcrumbs>
      <TypographyStylesProvider className={'readme'} pr={300} pb={'xl'}>
        <div
          dangerouslySetInnerHTML={{
            __html: marked.parse(atob(entry.content))
          }}
        />
      </TypographyStylesProvider>
      <AppShell.Aside w={300}>
        <ScrollArea>
          <Stack p={'md'}>
            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                About
              </Title>
              {url.value && (
                <Center>
                  <Image
                    src={`${url.value}/${entry.imageUrl}`}
                    fit="contain"
                    alt="preview"
                    radius="sm"
                  />
                </Center>
              )}
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
              {Array.from(chunks(entry.authors, 9)).map((chunk, i) => (
                <AvatarGroup key={i}>
                  {chunk.map((it) => (
                    <Avatar key={it.name} src={it.url} alt={it.name}>
                      {it.name.slice(0, 2)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              ))}
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
