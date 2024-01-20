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
import {
  EntryIndex,
  EntryInstall,
  EntryLatestRelease,
  useGetRegistryEntry,
  useGetRegistryEntryLatestRelease,
  useGetRegistryEntryInstall
} from '../../../client'
import { useSettings } from '../context/settings.context'
import { MdOutlineCategory } from 'react-icons/md'
import { client } from '../client'

export const RegistryEntryPageLoader: React.FC = () => {
  const { id } = useParams()
  const settings = useSettings()
  const entryIndex = useGetRegistryEntry(id || '', { axios: { baseURL: settings.registryUrl } })
  const latestRelease = useGetRegistryEntryLatestRelease(id || '', {
    axios: { baseURL: settings.registryUrl }
  })
  const installInfo = useGetRegistryEntryInstall(id || '', {
    axios: { baseURL: settings.registryUrl }
  })

  return (
    <>
      {(entryIndex.data?.data && (
        <RegistryEntryPage entry={entryIndex.data.data} latestRelease={latestRelease.data?.data} installInfo={installInfo.data?.data} />
      )) || <Alert color={'red'}>Registry Entry with ID {id} not found</Alert>}
    </>
  )
}

export type RegistryEntryPageProps = {
  entry: EntryIndex
  latestRelease?: EntryLatestRelease
  installInfo?: EntryInstall
}
export const RegistryEntryPage: React.FC<RegistryEntryPageProps> = ({ entry, latestRelease, installInfo }) => {
  const navigate = useNavigate()

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

            <Divider color={'gray'} />

            <Stack gap={'xs'}>
              <Title order={4} fw={500}>
                Manage
              </Title>
              {latestRelease && installInfo && (
              <Button size={'sm'} variant={'default'} onClick={async () => {
                const dir = await client.installation.installMod.query({githubPage: installInfo.repository || "", tag: latestRelease.tag, installMapArr: installInfo.assets  })
                console.warn(dir);
                }}>
                Install
              </Button>
              )}
            </Stack>
          </Stack>
        </ScrollArea>
      </AppShell.Aside>
    </Stack>
  )
}
