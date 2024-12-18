import { Alert, Button, Drawer, Group, Stack, Text } from '@mantine/core'
import useSWR from 'swr'
import { client } from '../client'
import { CodeHighlight } from '@mantine/code-highlight'
import { BsStars } from 'react-icons/bs'

export function DcsMissionScriptingModal() {
  const { data, mutate } = useSWR('isMissionScriptingValid', () =>
    client.validateMissionScriptingFile.query()
  )

  async function handleRepair() {
    await client.repairMissionScriptingFile.mutate()
    await mutate()
  }

  return (
    <Drawer
      offset={8}
      radius="md"
      position={'right'}
      title={'MissionScripting.lua Failed Check'}
      size={'xl'}
      opened={!data?.isValid}
      withCloseButton={false}
      onClose={() => {}}
    >
      <Stack gap={'xs'}>
        <Alert color={'red'}>
          <Text size={'sm'}>
            DCS Dropzone has detected an issue with the MissionScripting.lua file. The Dropzone
            MissionScripting.lua file must be present in the DCS MissionScripting.lua file so that
            the mods can function correctly.
          </Text>
        </Alert>

        <Text size={'sm'}>
          Please ensure that the following line is present in the MissionScripting.lua file before
          the Sanitize Mission Scripting environment line:
        </Text>
        <CodeHighlight language={'lua'} code={data?.expected || ''} />

        <Text size={'sm'}>Your File: {data?.path}</Text>
        <CodeHighlight language="lua" code={data?.content || ''} />

        <Group justify={'end'}>
          <Button onClick={handleRepair} leftSection={<BsStars />}>
            Repair
          </Button>
        </Group>
      </Stack>
    </Drawer>
  )
}
