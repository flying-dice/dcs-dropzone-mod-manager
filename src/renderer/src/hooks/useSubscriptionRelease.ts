import useSwr from 'swr'
import { client } from '../client'

export const useSubscriptionRelease = (modId: string) =>
  useSwr('getSubscriptionRelease', () => client.getSubscriptionRelease.query({ modId }), {
    refreshInterval: 1000
  })
