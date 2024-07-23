import React, { ReactNode } from 'react'
import { Alert, Button, Combobox, Group, Stack, Text, TextInput, Title } from '@mantine/core'
import { client } from '../client'
import { config } from '../../../config'
import { useConfig } from '../hooks/useConfig'
import useSWR from 'swr'
import { isEmpty } from 'lodash'
import { closeAllModals, openModal } from '@mantine/modals'
import { RegistryForm } from '../forms/registry.form'
import ClearButton = Combobox.ClearButton

const SettingEntry: React.FC<{
  name: string
  label: ReactNode
  description: ReactNode
  defaultValue?: string
  onClick: () => void
  disabled?: boolean
}> = ({ name, label, description, defaultValue, onClick, disabled }) => {
  const config = useConfig(name)

  return (
    <TextInput
      key={config.value.data?.lastModified}
      label={label}
      description={description}
      readOnly
      placeholder={defaultValue}
      value={config.value.data?.value}
      onClick={onClick}
      styles={{ input: { cursor: 'pointer' } }}
      rightSection={<ClearButton onClear={() => config.clear()} />}
      disabled={disabled}
    />
  )
}

const Configurables: React.FC<{
  defaultWriteDir: string
  defaultGameDir: string
  defaultRegistryUrl: string
}> = ({ defaultRegistryUrl, defaultGameDir, defaultWriteDir }) => {
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
        defaultValue={defaultWriteDir}
        onClick={() =>
          client.askFolder.query({ default: defaultWriteDir }).then((folder) => {
            if (!folder) return
            const [f] = folder.filePaths
            if (!f) return
            writeDir.set(f)
          })
        }
        disabled={isEmpty(defaultWriteDir)}
      />

      <SettingEntry
        name="gameDir"
        label="DCS Save Game folder"
        description="Where the users Mods and Scripts are installed, normally this is '%USERPROFILE%\Saved Games\DCS'"
        defaultValue={defaultGameDir}
        onClick={() =>
          client.askFolder.query({ default: defaultGameDir }).then((folder) => {
            if (!folder) return
            const [f] = folder.filePaths
            if (!f) return
            gameDir.set(f)
          })
        }
      />

      <SettingEntry
        name="registryUrl"
        label="Registry"
        description="The registry where the Mod Manager will look for Mods"
        defaultValue={defaultRegistryUrl}
        onClick={() =>
          openModal({
            title: 'Registry',
            children: (
              <RegistryForm
                initialValues={{ url: registryUrl.value.data?.value || defaultRegistryUrl }}
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
  const defaultRegistryUrl = config.defaultRegistryUrl
  const defaultWriteDir = useSWR('defaultWriteDir', () => client.getDefaultWriteDir.query())
  const defaultGameDir = useSWR('defaultGameDir', () => client.getDefaultGameDir.query())

  const update = useSWR('update', () => client.checkForUpdates.query())

  return (
    <Stack>
      <Title order={3}>Settings</Title>
      <Group>
        <Button loading={update.isLoading} onClick={() => update.mutate()}>
          Update Application
        </Button>
      </Group>

      {update.data && (
        <Alert color={'green'}>Up to Date! Version: {update.data.updateInfo.version}</Alert>
      )}
      {update.error && <Alert color={'red'}>{update.error.message}</Alert>}

      {defaultWriteDir.data && defaultGameDir.data && (
        <Configurables
          defaultRegistryUrl={defaultRegistryUrl}
          defaultWriteDir={defaultWriteDir.data}
          defaultGameDir={defaultGameDir.data}
        />
      )}

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
