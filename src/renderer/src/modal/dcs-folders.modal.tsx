import { Alert, Modal, Stack, Text, Title } from '@mantine/core'
import React from 'react'
import useSWR from 'swr'
import { client } from '../client'
import { SettingEntry } from '../container/setting-entry'
import { useConfig } from '../hooks/useConfig'

export type DcsFoldersModalProps = {}
export const DcsFoldersModal: React.FC<DcsFoldersModalProps> = ({}) => {
  const gameDir = useConfig('gameDir')
  const defaultGameDir = useSWR('getDefaultGameDir', () => client.getDefaultGameDir.query(), {
    refreshInterval: 1000
  })

  return (
    <Modal
      title={<Title order={3}>Uh Oh :(</Title>}
      size={'xl'}
      withCloseButton={false}
      onClose={() => {}}
      opened={!defaultGameDir.data && !gameDir.value.data}
    >
      <Stack>
        <Stack gap={'xs'}>
          <Text size={'sm'}>
            DCS Dropzone has not been able to locate the DCS Saved Games folder.
          </Text>
          <Text size={'sm'}>
            Please make sure DCS is installed correctly and the Saved Games folder is present and
            accessible.
          </Text>
          <Text size={'sm'}>
            If you know where the Saved Games folder is, provide the path below. This setting can be
            modified anytime from the Settings page.
          </Text>
        </Stack>
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

        {!defaultGameDir.data && (
          <Alert color={'red'}>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Failed to find the DCS "Saved Games" directory and no setting is present, this will need
            populating before any mods can be enabled.
          </Alert>
        )}
      </Stack>
    </Modal>
  )
}
