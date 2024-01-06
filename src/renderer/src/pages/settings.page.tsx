import React from 'react'
import { Alert, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core'
import { closeAllModals, openConfirmModal, openModal } from '@mantine/modals'
import { client } from '../client'
import { RegistryForm } from '../forms/registry.form'
import { useRegistry } from '../context/registry.context'
import { useInstallation } from '../context/installation.context'
import { useAsyncFn } from 'react-use'

export const SettingsPage: React.FC = () => {
  const registry = useRegistry()
  const installation = useInstallation()

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
        installation.setWriteDir(suggested.path)
        closeAllModals()
      },
      onCancel: () => {
        client.installation.getWriteDir.query().then((folder) => {
          installation.setWriteDir(folder)
        })
      }
    })
  }

  const handleRegistryChange = async (): Promise<void> => {
    openModal({
      title: 'Registry',
      children: (
        <RegistryForm
          initialValues={{ url: registry.url }}
          onCancel={closeAllModals}
          onSubmit={(values) => {
            registry.setUrl(values.url)
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
        description="Where the users Mods and Scripts are installed, normally this is '%USERPROFILE%\Saved Games\DCS'"
        readOnly
        placeholder="Set Installation folder"
        value={installation.writeDir}
        onClick={handleInstallFolderChange}
        styles={{ input: { cursor: 'pointer' } }}
      />
      <TextInput
        label="Registry"
        description="The registry where the Mod Manager will look for Mods"
        readOnly
        placeholder="Set Registry"
        value={registry.url}
        onClick={handleRegistryChange}
        styles={{ input: { cursor: 'pointer' } }}
      />

      <Group>
        <Button loading={updateAvailable.loading} onClick={() => fetchUpdate()}>
          Check for Updates
        </Button>
        {updateAvailable.value?.downloadPromise && (
          <Button onClick={() => client.updater.quitAndInstall.query()}>Restart</Button>
        )}
      </Group>

      {updateAvailable.value && (
        <Alert color={'green'}>
          Found Latest Version: {updateAvailable.value.updateInfo.version}
        </Alert>
      )}
      {updateAvailable.error && <Alert color={'red'}>{updateAvailable.error.message}</Alert>}
    </Stack>
  )
}
