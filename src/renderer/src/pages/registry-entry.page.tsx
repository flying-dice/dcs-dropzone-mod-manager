import React, { useCallback, useEffect, useState } from 'react'
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
  EntryLatestRelease,
  useGetRegistryEntry,
  useGetRegistryEntryLatestRelease,
  EntryInstallState
} from '../../../client'
import { useSettings } from '../context/settings.context'
import { MdOutlineCategory } from 'react-icons/md'
import { useInstallContext } from '@renderer/context/install.context'

export const RegistryEntryPageLoader: React.FC = () => {
  const { id } = useParams()
  const settings = useSettings()
  const entryIndex = useGetRegistryEntry(id || '', { axios: { baseURL: settings.registryUrl } })
  const latestRelease = useGetRegistryEntryLatestRelease(id || '', {
    axios: { baseURL: settings.registryUrl }
  })

  return (
    <>
      {(entryIndex.data?.data && (
        <RegistryEntryPage entry={entryIndex.data.data} latestRelease={latestRelease.data?.data} />
      )) || <Alert color={'red'}>Registry Entry with ID {id} not found</Alert>}
    </>
  )
}

export type RegistryEntryPageProps = {
  entry: EntryIndex
  latestRelease?: EntryLatestRelease
}
export const RegistryEntryPage: React.FC<RegistryEntryPageProps> = ({ entry, latestRelease }) => {
  const navigate = useNavigate()
  const installContext = useInstallContext()
  const [installState, setInstallState] = useState<EntryInstallState | null>(null)
  const isInstalling =
    latestRelease &&
    installContext.installStates &&
    Object.keys(installContext.installStates).some(
      (key) =>
        key.startsWith(entry.id) &&
        installContext.installStates &&
        installContext.installStates[key] &&
        !installContext.installStates[key].endsWith('Complete')
    )

  const getInstallState = async () => {
    if (!latestRelease) return
    const response = (await installContext.getInstallState(
      entry.id,
      latestRelease.assets
    )) as EntryInstallState
    setInstallState(response)
  }

  useEffect(() => {
    getInstallState()
  }, [setInstallState, latestRelease])

  const installMod = useCallback(async () => {
    if (!latestRelease || !latestRelease) return
    installContext.installMod(entry, latestRelease)
  }, [latestRelease, latestRelease])

  const unInstallMod = useCallback(async () => {
    if (!latestRelease) return
    const installStateResponse = (await installContext.uninstallMod(
      entry.id,
      latestRelease.assets
    )) as EntryInstallState
    setInstallState(installStateResponse)
  }, [latestRelease, setInstallState])

  const updateMod = useCallback(async () => {
    if (!latestRelease || !latestRelease) return
    const installStateResponse = (await installContext.uninstallMod(
      entry.id,
      latestRelease.assets
    )) as EntryInstallState
    setInstallState(installStateResponse)
    installContext.installMod(entry, latestRelease)
  }, [latestRelease, setInstallState])

  const toggleMod = useCallback(async () => {
    if (!latestRelease || !installState) return
    const installStateResponse = (
      installState?.enabled
        ? await installContext.disableMod(entry.id, latestRelease.assets)
        : await installContext.enableMod(entry.id, latestRelease.assets)
    ) as EntryInstallState
    setInstallState(installStateResponse)
  }, [latestRelease, installState, setInstallState])

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
              {latestRelease && installState && (
                <Group grow>
                  {!installState.installed ? (
                    <Button
                      size={'sm'}
                      variant={'default'}
                      onClick={installMod}
                      disabled={isInstalling || false}
                    >
                      {isInstalling ? 'Installing' : 'Install'}
                    </Button>
                  ) : (
                    <>
                      {installState.installedVersion != latestRelease.tag && (
                        <Button size={'sm'} variant={'default'} onClick={updateMod}>
                          Update
                        </Button>
                      )}
                      <Button size={'sm'} variant={'default'} onClick={toggleMod}>
                        {installState.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size={'sm'} variant={'default'} onClick={unInstallMod}>
                        Uninstall
                      </Button>
                    </>
                  )}
                </Group>
              )}
            </Stack>
          </Stack>
        </ScrollArea>
      </AppShell.Aside>
    </Stack>
  )
}
