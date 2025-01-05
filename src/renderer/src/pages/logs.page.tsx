import { Alert, Button, Flex, Group, MultiSelect, NumberInput, Stack } from '@mantine/core'
import { client } from '../client'
import { CodeHighlight } from '@mantine/code-highlight'
import { useAsyncFn, useLocalStorage, useMount } from 'react-use'

const defaultLogLevels = ['info', 'warn', 'error']

export function LogsPage() {
  const [logLevel, setLogLevel] = useLocalStorage<string[]>('loglevel')
  const [previousRows, setPreviousRows] = useLocalStorage<number>('previousRows', 30)
  const [logs, refresh] = useAsyncFn(
    async () =>
      client.getLogs.query({
        previousRows: previousRows || 30,
        logLevel: logLevel || defaultLogLevels
      }),
    [previousRows, logLevel]
  )

  useMount(refresh)

  return (
    <Stack>
      <Flex direction={'row'} gap={'md'} display={'flex'}>
        <Flex flex={'auto'}>
          <MultiSelect
            label={'Log level'}
            data={['verbose', 'debug', 'info', 'warn', 'error']}
            value={logLevel || defaultLogLevels}
            onChange={(value) => value && setLogLevel(value)}
            w={'100%'}
          />
        </Flex>
        <Group align={'end'}>
          <NumberInput
            label={'Previous rows'}
            value={previousRows || 30}
            onChange={(value) => value && setPreviousRows(+value)}
            min={10}
            max={1000}
            step={10}
          />
          <Button onClick={refresh}>Refresh</Button>
        </Group>
      </Flex>

      {logs.error && <Alert color={'red'}>{logs.error.message}</Alert>}
      {logs.value && <CodeHighlight language={'text'} code={logs.value} />}
    </Stack>
  )
}
