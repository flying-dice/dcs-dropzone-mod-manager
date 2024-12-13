import { ActionIcon, Badge, Group, Menu, Progress, Table, Text, Tooltip } from '@mantine/core'
import { BiCheckbox, BiCheckboxChecked, BiPlay } from 'react-icons/bi'
import { BsThreeDotsVertical } from 'react-icons/bs'

export type SubscriptionRowProps = {
  enabled: boolean
  modId: string
  modName: string
  version: string
  isLatest: boolean
  created: number
  onViewModPage: () => void
  onOpenSymlinksModal: () => void
  onOpenInExplorer: () => void
  onToggleMod: () => void
  onUpdate: () => void
  onRunExe?: () => void
  onUnsubscribe: () => void
  isReady: boolean
  stateLabel: string
  progress: number
}

export function SubscriptionRow(props: SubscriptionRowProps) {
  return (
    <Table.Tr c={props.enabled ? undefined : 'dimmed'}>
      <Table.Td>
        {props.onRunExe ? (
          <ActionIcon
            size={'md'}
            disabled={!props.isReady || !props.enabled}
            variant={'subtle'}
            onClick={props.onRunExe}
          >
            <BiPlay size={'1.25em'} />
          </ActionIcon>
        ) : (
          <ActionIcon
            size={'md'}
            disabled={!props.isReady}
            variant={'subtle'}
            onClick={props.onToggleMod}
          >
            {props.isReady && props.enabled ? (
              <BiCheckboxChecked size={'1.25em'} />
            ) : (
              <BiCheckbox size={'1.25em'} />
            )}
          </ActionIcon>
        )}
      </Table.Td>
      <Table.Td>
        <Text>{props.modName}</Text>
      </Table.Td>
      <Table.Td>
        <Group>
          <Text>{props.version}</Text>
          <Badge>{props.isLatest ? 'Latest' : 'Outdated'}</Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        {!props.isReady ? (
          <Tooltip label={props.stateLabel}>
            <Progress.Root size="lg">
              <Progress.Section value={props.progress} striped animated>
                <Progress.Label>{props.progress}%</Progress.Label>
              </Progress.Section>
            </Progress.Root>
          </Tooltip>
        ) : (
          props.stateLabel
        )}
      </Table.Td>
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
            <Menu.Item onClick={() => props.onToggleMod()} disabled={!props.isReady}>
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
