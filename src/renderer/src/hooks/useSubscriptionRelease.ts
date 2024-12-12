import useSwr from 'swr'
import { client } from '../client'

export const useSubscriptionRelease = (id: string) =>
  useSwr(`getSubscriptionRelease/${id}`, () => client.getSubscriptionRelease.query({ id }), {
    refreshInterval: 1000
  })
