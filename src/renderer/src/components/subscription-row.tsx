import { ActionIcon, Group, Menu, Progress, Stack, Table, Text, Tooltip } from '@mantine/core'
import { BiCheckbox, BiCheckboxChecked, BiPlay } from 'react-icons/bi'
import { BsThreeDotsVertical } from 'react-icons/bs'

function SubscriptionStatusColumn(props: {
  isLatest: boolean
  isReady: boolean
  isFailed: boolean
  stateLabel: string
  latestVersion?: string
  progress: number
  errors: string[]
}) {
  if (props.isReady && props.errors.length > 0) {
    const errors = props.errors.map((error, index) => (
      <Text key={index} size={'xs'}>
        {error}
      </Text>
    ))

    return (
      <Table.Td>
        <Tooltip label={<Stack gap={2}>{errors}</Stack>}>
          <Text fw={'bold'} c={'red'} size={'sm'}>
            Error
          </Text>
        </Tooltip>
      </Table.Td>
    )
  }

  if (props.isReady && props.isLatest) {
    return <Table.Td>Up to Date</Table.Td>
  }

  if (props.isReady && !props.isLatest) {
    return (
      <Table.Td>
        <Text fw={'bold'} c={'orange'} size={'sm'}>
          Outdated (Update to: {props.latestVersion})
        </Text>
      </Table.Td>
    )
  }

  if (props.isFailed) {
    return <Table.Td>{props.stateLabel}</Table.Td>
  }

  return (
    <Table.Td>
      <Tooltip label={props.stateLabel}>
        <Progress.Root size="lg">
          <Progress.Section value={props.progress} striped animated>
            <Progress.Label>{props.progress}%</Progress.Label>
          </Progress.Section>
        </Progress.Root>
      </Tooltip>
    </Table.Td>
  )
}

export type SubscriptionRowProps = {
  enabled: boolean
  modId: string
  modName: string
  version: string
  isLatest: boolean
  latestVersion?: string
  created: number
  onViewModPage: () => void
  onOpenSymlinksModal: () => void
  onOpenInExplorer: () => void
  onToggleMod: () => void
  onUpdate: () => void
  onRunExe?: () => void
  onUnsubscribe: () => void
  isReady: boolean
  isFailed: boolean
  stateLabel: string
  progress: number
  errors: string[]
}

export function SubscriptionRow(props: SubscriptionRowProps) {
  return (
    <Table.Tr c={props.enabled ? undefined : 'dimmed'}>
      <Table.Td>
        <ActionIcon
          size={'md'}
          disabled={!props.isReady || props.errors.length > 0}
          variant={'subtle'}
          onClick={props.onToggleMod}
        >
          {props.isReady && props.enabled ? (
            <BiCheckboxChecked size={'1.25em'} />
          ) : (
            <BiCheckbox size={'1.25em'} />
          )}
        </ActionIcon>
      </Table.Td>
      <Table.Td>
        <Group>
          {props.onRunExe && (
            <Tooltip label="Enable Mod to Run" openDelay={500}>
              <ActionIcon
                size={'md'}
                disabled={!props.isReady || !props.enabled}
                variant={'subtle'}
                onClick={props.onRunExe}
              >
                <BiPlay size={'1.25em'} />
              </ActionIcon>
            </Tooltip>
          )}
          <Text>{props.modName}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group>
          <Text>{props.version}</Text>
        </Group>
      </Table.Td>
      <SubscriptionStatusColumn
        isReady={props.isReady}
        isFailed={props.isFailed}
        errors={props.errors}
        stateLabel={props.stateLabel}
        progress={props.progress}
        isLatest={props.isLatest}
        latestVersion={props.latestVersion}
      />
      <Table.Td>{new Date(props.created).toLocaleString()}</Table.Td>
      <Table.Td>
        <Menu>
          <Menu.Target>
            <ActionIcon size={'lg'} variant={'subtle'}>
              <BsThreeDotsVertical />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {!props.isLatest && <Menu.Item onClick={props.onUpdate}>Update</Menu.Item>}
            <Menu.Item
              onClick={() => props.onToggleMod()}
              disabled={!props.isReady || props.errors.length > 0}
            >
              {props.enabled ? 'Disable' : 'Enable'}
            </Menu.Item>
            <Menu.Item onClick={props.onViewModPage}>View Mod Page</Menu.Item>
            <Menu.Item onClick={props.onOpenSymlinksModal}>View Install Details</Menu.Item>
            <Menu.Item onClick={props.onOpenInExplorer}>Open in Explorer</Menu.Item>
            <Menu.Item onClick={props.onUnsubscribe}>Unsubscribe</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  )
}
