import useSwr from 'swr'
import { client } from '../client'

export const useSubscriptionRelease = (modId: string) =>
  useSwr(`getSubscriptionRelease/${modId}`, () => client.getSubscriptionRelease.query({ modId }), {
    refreshInterval: 1000
  })
