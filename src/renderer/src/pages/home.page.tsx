import React, { useCallback, useEffect, useState } from 'react'
import { ActionIcon, Checkbox, Group, Stack, Title, Divider } from '@mantine/core'
import { useInstallContext } from '@renderer/context/install.context'
import { EachEntryInstallState } from 'src/client'
import { VscLinkExternal, VscTrash } from 'react-icons/vsc'
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

  const unInstallMod = useCallback(
    async (entry: EachEntryInstallState) => {
      await installContext.uninstallMod(entry.id, entry.installMapArr)
      await getInstalledMap()
    },
    [setInstalledMap]
  )

  return (
    <Stack>
      <Title order={3}>Mods</Title>
      <Stack gap="xs">
        {Object.entries(installedMap).map(([key, value]) => (
          <>
            <Divider />
            <Group key={key} justify="space-between">
              <Checkbox
                defaultChecked={value.installState.enabled}
                label={`${key}: ${value.version}`}
                onClick={() => toggleMod(value)}
              />
              <Group gap="xs">
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
