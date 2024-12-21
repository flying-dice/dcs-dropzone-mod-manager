import { Alert, Stack, Table, TextInput } from '@mantine/core'
import { client } from '../client'
import { useFuse } from '../hooks/useFuse'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { showErrorNotification, showSuccessNotification } from '../utils/notifications'
import { SubscriptionRow } from '../components/subscription-row'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export type SubscriptionsProps = {
  onOpenSymlinksModal: (modId: string) => void
}
export function Subscriptions({ onOpenSymlinksModal }: SubscriptionsProps) {
  const navigate = useNavigate()
  const subscriptions = useSubscriptions()
  const { results, search, setSearch } = useFuse(subscriptions.data || [], '', [
    'subscription.modId',
    'subscription.modName'
  ])

  console.log(results)

  useEffect(() => {
    if (subscriptions.data?.some(({ state }) => state.progress !== 100 && !state.isFailed)) {
      setTimeout(() => subscriptions.mutate(), 500)
    }
  }, [subscriptions.data])

  async function handleUnsubscribe(modId: string) {
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
    } catch (err) {
      showErrorNotification(err)
    }
  }

  async function handleRunExe(modId: string, exePath: string) {
    try {
      await client.runExe.mutate({ modId, exePath })
    } catch (err) {
      showErrorNotification(err)
    }
  }

  async function handleUpdate(modId: string) {
    await client.update.mutate({ modId })
  }

  return (
    <Stack>
      <TextInput
        placeholder={'Search'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {subscriptions.data?.some((it) => it.state.isReady && it.state.errors.length > 0) && (
        <Alert color={'red'}>
          Some mods have failed integrity checks. Unsubscribe and re-subscribe to fix the issue.
        </Alert>
      )}
      {subscriptions.data?.length === 0 ? (
        <Alert>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          It looks like you haven't subscribed to any mods yet. Visit the{' '}
          <a
            href=""
            onClick={(e) => {
              e.preventDefault()
              navigate('/library/')
            }}
          >
            <strong>Library</strong>
          </a>{' '}
          to get started.
        </Alert>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={48}></Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Version</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th w={200}>Installed Date</Table.Th>
              <Table.Th w={64}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {results.map(({ subscription, state }) => (
              <SubscriptionRow
                key={subscription.id}
                modId={subscription.modId}
                modName={subscription.modName}
                created={subscription.created}
                onOpenSymlinksModal={() => onOpenSymlinksModal(subscription.modId)}
                onUpdate={() => handleUpdate(subscription.modId)}
                onUnsubscribe={() => handleUnsubscribe(subscription.modId)}
                onViewModPage={() => navigate(`/library/${subscription.modId}`)}
                progress={state.progress}
                isReady={state.isReady}
                onOpenInExplorer={() => client.openInExplorer.mutate({ modId: subscription.modId })}
                isLatest={state.isLatest}
                version={state.version}
                enabled={state.enabled}
                onToggleMod={() => handleToggleMod(subscription.modId)}
                stateLabel={state.currentTaskLabel || state.progressLabel}
                onRunExe={
                  state.exePath
                    ? () => state.exePath && handleRunExe(subscription.modId, state.exePath)
                    : undefined
                }
                isFailed={state.isFailed}
                errors={state.errors}
                latestVersion={state.latest}
              />
            ))}
          </Table.Tbody>
          {results.length === 0 && (
            <Table.Caption>
              <Alert>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                Did you subscribe to the mod you're looking for? Check the{' '}
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/library/')
                  }}
                >
                  <strong>Library</strong>
                </a>{' '}
                to get started.
              </Alert>
            </Table.Caption>
          )}
        </Table>
      )}
    </Stack>
  )
}
