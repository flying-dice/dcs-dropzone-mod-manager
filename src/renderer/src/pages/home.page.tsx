import React, { useCallback, useEffect, useState } from 'react'
import { ActionIcon, Checkbox, Group, Stack, Title, Divider, Tooltip } from '@mantine/core'
import { useInstallContext } from '@renderer/context/install.context'
import { EachEntryInstallState } from 'src/client'
import { VscCloudDownload, VscLinkExternal, VscTrash } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'

export type HomePageProps = {}
export const HomePage: React.FC<HomePageProps> = ({}) => {
  const navigate = useNavigate()
  const [installedMap, setInstalledMap] = useState<Record<string, EachEntryInstallState>>({})
  const installContext = useInstallContext()

  const getInstalledMap = async () => {
    const response = await installContext.getAllInstalled()
    setInstalledMap(response)
  }

  useEffect(() => {
    getInstalledMap()
  }, [setInstalledMap])

  const toggleMod = useCallback(
    async (entry: EachEntryInstallState) => {
      entry.installState.enabled
        ? await installContext.disableMod(entry.id, entry.installMapArr)
        : await installContext.enableMod(entry.id, entry.installMapArr)
      await getInstalledMap()
    },
    [setInstalledMap]
  )

  const updateAllMods = () => {
    Object.values(installedMap).forEach((value) => {
      if (value.installState.installedVersion !== value.installState.latestRelease.version) {
        updateMod(value)
      }
    })
  }

  const updateMod = useCallback(
    async (installState: EachEntryInstallState) => {
      await installContext.uninstallMod(installState.id, installState.installMapArr)
      installContext.installMod(
        installState.installState.entry,
        installState.installState.latestRelease
      )
      await getInstalledMap()
    },
    [setInstalledMap]
  )

  const unInstallMod = useCallback(
    async (entry: EachEntryInstallState) => {
      await installContext.uninstallMod(entry.id, entry.installMapArr)
      await getInstalledMap()
    },
    [setInstalledMap]
  )

  const modCount = Object.keys(installedMap).length
  const anyUpdates = Object.values(installedMap).some(
    (value) => value.installState.installedVersion !== value.installState.latestRelease.version
  )

  return (
    <Stack>
      <Group>
      <Title order={3}>Mods</Title>
      {anyUpdates && (
        <Tooltip label="Update All Mods">
          <ActionIcon
            radius={0}
            size={'sm'}
            color="orange"
            variant={'subtle'}
            onClick={() => updateAllMods()}
          >
            <VscCloudDownload />
          </ActionIcon>
        </Tooltip>
      )}
      </Group>
      <Stack gap="xs">
        {modCount === 0 && <Title order={4}>No mods installed</Title>}
        {modCount > 0 &&
          Object.entries(installedMap).map(([key, value]) => (
            <>
              <Divider />
              <Group key={key} justify="space-between">
                <Checkbox
                  defaultChecked={value.installState.enabled}
                  label={`${key}: ${value.version}`}
                  onClick={() => toggleMod(value)}
                />
                <Group gap="xs">
                  {value.installState.installedVersion !==
                    value.installState.latestRelease.version && (
                    <Tooltip
                      label={`${value.installState.installedVersion} => ${value.installState.latestRelease.version}`}
                    >
                      <ActionIcon
                        radius={0}
                        size={'sm'}
                        variant={'subtle'}
                        color="orange"
                        onClick={() => updateMod(value)}
                      >
                        <VscCloudDownload color="amber" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <ActionIcon
                    radius={0}
                    size={'sm'}
                    variant={'subtle'}
                    onClick={() => navigate(`/library/${value.id}`)}
                  >
                    <VscLinkExternal />
                  </ActionIcon>

                  <ActionIcon
                    radius={0}
                    size={'sm'}
                    variant={'subtle'}
                    onClick={() => unInstallMod(value)}
                  >
                    <VscTrash />
                  </ActionIcon>
                </Group>
              </Group>
            </>
          ))}
      </Stack>
    </Stack>
  )
}
