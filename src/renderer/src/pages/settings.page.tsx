import { Alert, Button, Group, Stack, Text, Title } from '@mantine/core'
import { closeAllModals, openModal } from '@mantine/modals'
import { isEmpty } from 'lodash'
import React from 'react'
import useSWR from 'swr'
import { client } from '../client'
import { SettingEntry } from '../container/setting-entry'
import { RegistryForm } from '../forms/registry.form'
import { useConfig } from '../hooks/useConfig'

const Configurables: React.FC = () => {
  const defaultRegistryUrl = useSWR('defaultRegistryUrl', () =>
    client.getDefaultRegistryUrl.query()
  )
  const defaultWriteDir = useSWR('defaultWriteDir', () => client.getDefaultWriteDir.query())
  const defaultGameDir = useSWR('defaultGameDir', () => client.getDefaultGameDir.query())

  const writeDir = useConfig('writeDir')
  const gameDir = useConfig('gameDir')
  const registryUrl = useConfig('registryUrl')

  return (
    <Stack>
      <Title order={3}>Configuration</Title>

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

      {!defaultWriteDir.data && <Alert color={'red'}>Failed to get default write directory</Alert>}

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
  return (
    <Stack>
      <Configurables />

      <Title order={3}>RCLONE</Title>
      <Stack gap={'xs'}>
        <Text size={'xs'} c={'dimmed'}>
          RCLONE is a command line utility that we use to interact with cloud storage. It is
          downloaded automatically to ensure API version compatability.
        </Text>
        <Text size={'xs'} c={'dimmed'}>
          Its run in daemon mode and can be managed via the RCLONE Admin interface (there are no
          credentials just click login). dcs-dropzone interacts with it using API calls.
        </Text>
      </Stack>

      <Group>
        <Button
          onClick={() => {
            window.open('http://localhost:5572/#/dashboard', '_blank')
          }}
        >
          Open RCLONE Admin
        </Button>
      </Group>
    </Stack>
  )
}
