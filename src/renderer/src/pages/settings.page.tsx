import React from 'react'
import { Alert, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core'
import { closeAllModals, openConfirmModal, openModal } from '@mantine/modals'
import { client } from '../client'
import { RegistryForm } from '../forms/registry.form'
import { useSettings } from '../context/settings.context'
import { useAsyncFn } from 'react-use'
import { observer } from 'mobx-react-lite'

export const SettingsPage: React.FC = observer(() => {
  const settings = useSettings()

  const handleInstallFolderChange = async (): Promise<void> => {
    const suggested = await client.installation.getDefaultWriteDir.query()
    openConfirmModal({
      title: 'Installation folder',
      children: (
        <Stack gap={10}>
          <Text>Do you want to use the suggested installation folder?</Text>
          <Text>{suggested.path}</Text>
        </Stack>
      ),
      confirmProps: {
        color: 'blue',
        children: 'Use Suggested'
      },
      cancelProps: {
        variant: 'subtle',
        color: 'red',
        children: 'Choose another folder'
      },
      onConfirm: () => {
        settings.setWriteDir(suggested.path)
        closeAllModals()
      },
      onCancel: () => {
        client.installation.getWriteDir.query().then((folder) => {
          settings.setWriteDir(folder)
        })
      }
    })
  }

  const handleSaveGameFolderChange = async (): Promise<void> => {
    const suggested = await client.installation.getDefaultSaveGameDir.query()
    openConfirmModal({
      title: 'DCS Save Game folder',
      children: (
        <Stack gap={10}>
          <Text>Do you want to use the suggested DCS Save Game folder?</Text>
          <Text>{suggested.path}</Text>
        </Stack>
      ),
      confirmProps: {
        color: 'blue',
        children: 'Use Suggested'
      },
      cancelProps: {
        variant: 'subtle',
        color: 'red',
        children: 'Choose another folder'
      },
      onConfirm: () => {
        settings.setSaveGameDir(suggested.path)
        closeAllModals()
      },
      onCancel: () => {
        client.installation.getWriteDir.query().then((folder) => {
          settings.setSaveGameDir(folder)
        })
      }
    })
  }

  const handleRegistryChange = async (): Promise<void> => {
    openModal({
      title: 'Registry',
      children: (
        <RegistryForm
          initialValues={{ url: settings.registryUrl }}
          onCancel={closeAllModals}
          onSubmit={(values) => {
            settings.setRegistryUrl(values.url)
            closeAllModals()
          }}
        />
      )
    })
  }

  const [updateAvailable, fetchUpdate] = useAsyncFn(
    async () => client.updater.checkForUpdates.query(),
    []
  )

  return (
    <Stack>
      <Title order={3}>Settings</Title>
      <TextInput
        label="Installation folder"
        description="This is where we will store the mod files"
        readOnly
        placeholder="Set Installation folder"
        value={settings.writeDir}
        onClick={handleInstallFolderChange}
        styles={{ input: { cursor: 'pointer' } }}
      />
      <TextInput
        label="DCS Save Game folder"
        description="Where the users Mods and Scripts are installed, normally this is '%USERPROFILE%\Saved Games\DCS'"
        readOnly
        placeholder="Set Save Game folder"
        value={settings.saveGameDir}
        onClick={handleSaveGameFolderChange}
        styles={{ input: { cursor: 'pointer' } }}
      />
      <TextInput
        label="Registry"
        description="The registry where the Mod Manager will look for Mods"
        readOnly
        placeholder="Set Registry"
        value={settings.registryUrl}
        onClick={handleRegistryChange}
        styles={{ input: { cursor: 'pointer' } }}
      />

      <Group>
        <Button loading={updateAvailable.loading} onClick={() => fetchUpdate()}>
          Update Application
        </Button>
      </Group>

      {updateAvailable.value && (
        <Alert color={'green'}>
          Up to Date! Version: {updateAvailable.value.updateInfo.version}
        </Alert>
      )}
      {updateAvailable.error && <Alert color={'red'}>{updateAvailable.error.message}</Alert>}
    </Stack>
  )
})
