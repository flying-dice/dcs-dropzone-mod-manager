import { ActionIcon, Alert, Anchor, Stack, Text, TextInput } from '@mantine/core'
import { closeAllModals, openModal } from '@mantine/modals'
import { isEmpty } from 'lodash'
import React from 'react'
import useSWR from 'swr'
import { client } from '../client'
import { SettingEntry } from '../container/setting-entry'
import { RegistryForm } from '../forms/registry.form'
import { useConfig } from '../hooks/useConfig'
import { CgExternal } from 'react-icons/cg'
import { useAsyncFn } from 'react-use'
import { showErrorNotification } from '../utils/notifications'
import { useNavigate } from 'react-router-dom'
import { useMissionScriptingFile } from '@renderer/hooks/useMissionScriptingFile'
import { MissionScriptingStatusCode } from '../../../lib/mission-scripting'

export function MissionScriptingConfig() {
  const navigate = useNavigate()
  const dcsInstallationDir = useSWR('dcsInstallationDir', () =>
    client.getDcsInstallationDirectory.query()
  )
  const missionScripting = useMissionScriptingFile()

  const [, setDcsInstallationDir] = useAsyncFn(async (path: string) => {
    try {
      await client.setDcsInstallationDirectory.mutate({ path })
      await dcsInstallationDir.mutate()
      await missionScripting.refresh()
    } catch (e) {
      showErrorNotification(e)
    }
  })

  return (
    <Stack gap={'xs'}>
      <TextInput
        pointer
        label="DCS Installation Directory"
        description="Where the DCS World Installation resides, normally this is 'C:\Program Files\Eagle Dynamics\DCS World'"
        value={dcsInstallationDir.data || ''}
        onClick={() =>
          client.askFolder.query({ default: '' }).then((folder) => {
            if (!folder) return
            const [f] = folder.filePaths
            if (!f) return
            setDcsInstallationDir(f)
          })
        }
      />
      {missionScripting.error && <Alert color="red">{missionScripting.error.message}</Alert>}
      {!missionScripting.error &&
        missionScripting.current?.status !== MissionScriptingStatusCode.VALID && (
          <Alert color={'red'}>
            <Text size={'sm'}>
              The MissionScripting.lua file is not configured correctly, please see the{' '}
              <Anchor onClick={() => navigate('/mission-scripting')}>Mission Scripting</Anchor> page
              for more information.
            </Text>
          </Alert>
        )}
    </Stack>
  )
}

const Configurables: React.FC = () => {
  const defaultRegistryUrl = useSWR('defaultRegistryUrl', () =>
    client.getDefaultRegistryUrl.query()
  )
  const defaultGameDir = useSWR('defaultGameDir', () => client.getDefaultGameDir.query())
  const defaultWriteDir = useSWR('defaultWriteDir', () => client.getDefaultWriteDir.query())

  const gameDir = useConfig('gameDir')
  const writeDir = useConfig('writeDir')
  const registryUrl = useConfig('registryUrl')

  return (
    <Stack>
      <SettingEntry
        name="writeDir"
        label="Mods folder"
        description="This is where we will store the mod files"
        defaultValue={defaultWriteDir.data}
        onClick={() =>
          client.askFolder.query({ default: defaultWriteDir.data || '' }).then((folder) => {
            if (!folder) return
            const [f] = folder.filePaths
            if (!f) return
            writeDir.set(f)
          })
        }
      />

      {!defaultWriteDir.data && isEmpty(writeDir.value.data) && <Alert color={'red'}>Failed to get default write directory</Alert>}

      <SettingEntry
        name="gameDir"
        label="DCS Save Game folder"
        description="Where the users Mods and Scripts are installed, normally this is '%USERPROFILE%\Saved Games\DCS'"
        defaultValue={defaultGameDir.data}
        onClick={() =>
          client.askFolder.query({ default: defaultGameDir.data || '' }).then((folder) => {
            if (!folder) return
            const [f] = folder.filePaths
            if (!f) return
            gameDir.set(f)
          })
        }
      />

      {!defaultGameDir.data && isEmpty(gameDir.value.data) && (
        <Alert color={'red'}>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Failed to find the DCS "Saved Games" directory and no setting is present, this will need
          populating before any mods can be enabled.
        </Alert>
      )}

      <SettingEntry
        name="registryUrl"
        label="Registry"
        description="The registry where the Mod Manager will look for Mods"
        defaultValue={defaultRegistryUrl.data}
        onClick={() =>
          openModal({
            title: 'Registry',
            children: (
              <RegistryForm
                initialValues={{
                  url: registryUrl.value.data?.value || defaultRegistryUrl.data || ''
                }}
                onCancel={closeAllModals}
                onSubmit={(values) => {
                  registryUrl.set(values.url)
                  closeAllModals()
                }}
                onReset={() => {
                  registryUrl.clear()
                  closeAllModals()
                }}
              />
            )
          })
        }
      />
    </Stack>
  )
}

export const SettingsPage: React.FC = () => {
  const currentVersion = useSWR('currentVersion', () => client.currentVersion.query())

  return (
    <Stack gap={'xl'}>
      <Stack>
        <TextInput
          label="Current Version"
          value={currentVersion.data}
          description={'This is the version of the Mod Manager that you are currently running'}
          readOnly
          rightSection={
            <ActionIcon
              variant={'subtle'}
              onClick={() =>
                window.open(
                  'https://github.com/flying-dice/dcs-dropzone-mod-manager/releases',
                  '_blank'
                )
              }
            >
              <CgExternal />
            </ActionIcon>
          }
        />

        <MissionScriptingConfig />
      </Stack>

      <Configurables />
    </Stack>
  )
}
