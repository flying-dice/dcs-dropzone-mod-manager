import React from 'react'
import { useSubscriptions } from '../hooks/useSubscriptions'
import {
  ActionIcon,
  Alert,
  Menu,
  Progress,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core'
import { useFuse } from '../hooks/useFuse'
import { client } from '../client'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { showErrorNotification, showSuccessNotification } from '../utils/notifications'
import { BiCheckbox, BiCheckboxChecked } from 'react-icons/bi'
import { useSubscriptionRelease } from '../hooks/useSubscriptionRelease'

const SubscriptionRow: React.FC<{ modId: string; modName: string; created: number }> = ({
  modId,
  modName,
  created
}) => {
  const subscriptions = useSubscriptions()
  const release = useSubscriptionRelease(modId)

  async function handleUnsubscribe(modId: string, name: string) {
    try {
      await client.unsubscribe.mutate({ modId })
      await subscriptions.mutate()
      showSuccessNotification(`Unsubscribed from ${name}`)
    } catch (err) {
      showErrorNotification(err)
    }
  }

  async function handleToggleMod(modId: string) {
    try {
      await client.toggleMod.mutate({ modId })
      await subscriptions.mutate()
      await release.mutate()
    } catch (err) {
      showErrorNotification(err)
    }
  }

  return (
    <Table.Tr c={release.data?.enabled ? undefined : 'dimmed'}>
      <Table.Td>
        <ActionIcon
          size={'md'}
          disabled={release.data?.status !== 'Completed'}
          variant={'subtle'}
          onClick={() => handleToggleMod(modId)}
        >
          {release.data?.enabled ? (
            <BiCheckboxChecked size={'1.25em'} />
          ) : (
            <BiCheckbox size={'1.25em'} />
          )}
        </ActionIcon>
      </Table.Td>
      <Table.Td>
        <Text>{modName}</Text>
      </Table.Td>
      <Table.Td>{release.data?.version}</Table.Td>
      <Table.Td>
        {release.data?.status === 'In Progress' ? (
          <Tooltip label={release.data.label}>
            <Progress.Root size="lg">
              <Progress.Section
                value={release.data?.progress || 0}
                striped={release.data?.status === 'In Progress'}
                animated={release.data?.status === 'In Progress'}
              >
                <Progress.Label>{release.data?.progress}%</Progress.Label>
              </Progress.Section>
            </Progress.Root>
          </Tooltip>
        ) : (
          release.data?.status
        )}
      </Table.Td>
      <Table.Td>{new Date(created).toLocaleString()}</Table.Td>
      <Table.Td>
        <Menu>
          <Menu.Target>
            <ActionIcon size={'lg'} variant={'subtle'}>
              <BsThreeDotsVertical />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => handleToggleMod(modId)}>
              {release.data?.enabled ? 'Disable' : 'Enable'}
            </Menu.Item>
            <Menu.Item onClick={() => client.openInExplorer.mutate({ modId: modId })}>
              Open in Explorer
            </Menu.Item>
            <Menu.Item onClick={() => handleUnsubscribe(modId, modName)}>Unsubscribe</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  )
}

export type SubscriptionsProps = {}
export const Subscriptions: React.FC<SubscriptionsProps> = ({}) => {
  const subscriptions = useSubscriptions()
  const { results, search, setSearch } = useFuse(subscriptions.data || [], '', ['modId', 'modName'])

  return (
    <Stack>
      <TextInput
        placeholder={'Search'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {subscriptions.data?.length === 0 ? (
        <Alert>
          It looks like you haven't subscribed to any mods yet. Visit the Library to get started.
        </Alert>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={48}></Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Version</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th w={200}>Date</Table.Th>
              <Table.Th w={64}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map((element) => (
              <SubscriptionRow
                key={element.id}
                modId={element.modId}
                modName={element.modName}
                created={element.created}
              />
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  )
}
