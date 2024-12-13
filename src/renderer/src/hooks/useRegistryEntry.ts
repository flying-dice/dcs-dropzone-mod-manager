import useSWR from 'swr'
import { client } from '../client'

export const useRegistryEntry = (modId: string) => {
  const index = useSWR(`registry/${modId}`, async () => {
    return client.getRegistryEntry.query({ modId })
  })

  return {
    index
  }
}
