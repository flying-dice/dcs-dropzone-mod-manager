import { CodeHighlight } from '@mantine/code-highlight'
import { Alert, Button, Code, Group, Stack, Text, Title } from '@mantine/core'
import {
  MISSION_SCRIPTING_TRIGGER,
  MISSION_SCRIPTING_TRIGGER_BEFORE,
  MissionScriptingStatusCode
} from '../../../lib/mission-scripting'
import { BsStars } from 'react-icons/bs'
import { openConfirmModal } from '@mantine/modals'
import { showErrorNotification } from '@renderer/utils/notifications'
import { useMissionScriptingFile } from '@renderer/hooks/useMissionScriptingFile'

export function MissionScriptingPage() {
  const missionScripting = useMissionScriptingFile()

  async function handleFixMissionScripting() {
    const { proposed, existing } = await missionScripting.getChanges()
    try {
      openConfirmModal({
        size: 'xl',
        title: 'Fix Mission Scripting',
        children: (
          <Stack>
            <Alert color={'orange'}>
              This change must be reverted manually if you uninstall DCS Dropzone Mod Manager.
            </Alert>
            <Group>
              <Text fw={'bold'}>Existing</Text>
              <CodeHighlight maw={'100%'} language={'lua'} code={existing} />
              <Text fw={'bold'}>New</Text>
              <CodeHighlight maw={'100%'} language={'lua'} code={proposed} />
            </Group>
          </Stack>
        ),
        confirmProps: { color: 'red', children: 'Apply' },
        cancelProps: { children: 'Cancel' },
        onConfirm: async () => {
          await missionScripting.applyChanges()
        }
      })
    } catch (e) {
      showErrorNotification(e)
    }
  }

  return (
    <Stack>
      <Title order={3}>Mission Scripting</Title>

      <Text size={'sm'}>
        The MissionScripting.lua must be configured correctly for the Dropzone Mod Manager to run
        Mission Scripting mods.
      </Text>

      <Text size={'sm'}>
        Please ensure the <Code>dofile</Code> line is present in your{' '}
        <Code>MissionScripting.lua</Code> file before the sanitizing is started:
      </Text>

      <CodeHighlight
        language="lua"
        code={[MISSION_SCRIPTING_TRIGGER, '...', MISSION_SCRIPTING_TRIGGER_BEFORE].join('\n')}
      />

      {missionScripting.error && <Alert color="red">{missionScripting.error.message}</Alert>}

      {missionScripting.current?.status === MissionScriptingStatusCode.TRIGGER_MISSING && (
        <Group>
          <Button leftSection={<BsStars />} onClick={handleFixMissionScripting}>
            Fix it for me
          </Button>
        </Group>
      )}

      {missionScripting.current?.status === MissionScriptingStatusCode.VALID && (
        <Alert color={'green'}>
          <Text size={'sm'}>The MissionScripting.lua file is configured correctly.</Text>
        </Alert>
      )}
    </Stack>
  )
}
