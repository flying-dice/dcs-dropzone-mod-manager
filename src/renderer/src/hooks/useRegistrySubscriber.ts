import { EntryIndexHydrated } from '../../../lib/types'
import { client } from '../client'
import { showErrorNotification, showSuccessNotification } from '../utils/notifications'
import { useSubscriptions } from './useSubscriptions'

export const useRegistrySubscriber = (registryEntry: EntryIndexHydrated) => {
  const allSubscriptions = useSubscriptions()

  return {
    isSubscribed: allSubscriptions.data?.some((it) => it.subscription.modId === registryEntry.id),
    subscribe: async () => {
      try {
        console.log('Subscribed to registry entry:', registryEntry)
        await client.subscribe.mutate({ modId: registryEntry.id })
        if (registryEntry.dependencies) {
          for (const dependency of registryEntry.dependencies) {
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
        showSuccessNotification(`Subscribed to ${registryEntry.name}`)
      } catch (e) {
        showErrorNotification(e)
      } finally {
        await allSubscriptions.mutate()
      }
    },
    unsubscribe: async () => {
      try {
        console.log('Unsubscribed from registry entry:', registryEntry)
        await client.unsubscribe.mutate({ modId: registryEntry.id })
        showSuccessNotification(`Unsubscribed from ${registryEntry.name}`)
      } catch (e) {
        showErrorNotification(e)
      } finally {
        await allSubscriptions.mutate()
      }
    }
  }
}
