import { Alert, Stack, Table, TextInput } from '@mantine/core'
import { client } from '../client'
import { useFuse } from '../hooks/useFuse'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { showErrorNotification, showSuccessNotification } from '../utils/notifications'
import { SubscriptionRow } from '../components/subscription-row'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { showNotification } from '@mantine/notifications'
import { EntryIndexSimple } from 'src/lib/types'
import { Subscription } from 'src/main/schemas/subscription.schema'
import { SubscriptionWithState } from 'src/main/manager/subscription.manager'

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

  useEffect(() => {
    if (subscriptions.data?.some(({ state }) => state.progress !== 100 && !state.isFailed)) {
      setTimeout(() => subscriptions.mutate(), 500)
    }
  }, [subscriptions.data])

  useEffect(() => {
    handleDisableInvalidMods()
  }, [subscriptions.data])

  async function handleDisableInvalidMods() {
    let actioned = false
    for (const { subscription, state } of subscriptions.data || []) {
      if (state.isReady && state.errors.length > 0 && state.enabled) {
        await client.toggleMod.mutate({ modId: subscription.modId })
        showNotification({
          color: 'orange',
          title: 'Mod disabled',
          message: `Disabled ${subscription.modName} due to integrity check failure`
        })
        actioned = true
      }
    }

    if (actioned) {
      await subscriptions.mutate()
    }
  }

  async function handleUnsubscribe(modId: string) {
    try {
      await client.unsubscribe.mutate({ modId })
      await subscriptions.mutate()
      showSuccessNotification(`Unsubscribed from ${name}`)
    } catch (err) {
      showErrorNotification(err)
    }
  }

  async function handleToggleMod(sub: Subscription) {
    try {
      const isEnabled = await client.toggleMod.mutate({ modId: sub.modId })
      if (sub.dependencies && isEnabled) {
        await Promise.all(
          sub.dependencies.map((dep) =>
            client.toggleMod.mutate({ modId: dep.id, enableOnly: true })
          )
        )
      }
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
    await subscriptions.mutate()
  }

  async function handlePinUpdate(modId: string, version: string) {
    await client.update.mutate({ modId, version })
    await subscriptions.mutate()
  }

  async function handleSubscribeToMissingDeps(
    dependencies: EntryIndexSimple[],
    subscriptions: SubscriptionWithState[]
  ) {
    for (const dependency of dependencies) {
      if (subscriptions.some((sub) => sub.subscription.modId === dependency.id)) continue
      try {
        await client.subscribe.mutate({ modId: dependency.id })
        showSuccessNotification(`Subscribed to ${dependency.name}`)
      } catch (e) {
        // Ignore errors for now
        console.error('Failed to subscribe to dependency:', dependency, e)
        showErrorNotification(e)
      }
    }
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
            {results.map(({ subscription, state, versions }) => (
              <SubscriptionRow
                key={subscription.id}
                modId={subscription.modId}
                modName={subscription.modName}
                created={subscription.created}
                onOpenSymlinksModal={() => onOpenSymlinksModal(subscription.modId)}
                onUpdate={() => handleUpdate(subscription.modId)}
                onPin={(version: string) => handlePinUpdate(subscription.modId, version)}
                onFixMissingDeps={() =>
                  handleSubscribeToMissingDeps(subscription.dependencies, results)
                }
                onUnsubscribe={() => handleUnsubscribe(subscription.modId)}
                onViewModPage={() => navigate(`/library/${subscription.modId}`)}
                progress={state.progress}
                isReady={state.isReady}
                onOpenInExplorer={() => client.openInExplorer.mutate({ modId: subscription.modId })}
                isPinned={state.isPinned}
                isLatest={state.isLatest}
                version={state.version}
                versions={versions}
                enabled={state.enabled}
                onToggleMod={() => handleToggleMod(subscription)}
                stateLabel={state.currentTaskLabel || state.progressLabel}
                missingDeps={subscription.dependencies?.filter(
                  (dep) => !results.some((sub) => sub.subscription.modId === dep.id)
                )}
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
