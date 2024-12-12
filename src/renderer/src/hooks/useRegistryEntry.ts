import { useEffect } from 'react'
import useSWR from 'swr'
import { getRegistryEntry } from '../../../lib/client'
import { client } from '../client'
import { useRegistryUrl } from './useRegistryUrl'

export const useRegistryEntry = (modId: string) => {
  const registryUrl = useRegistryUrl()

  const index = useSWR(`registry/${modId}`, async () => {
    const registryUrl = await client.getRegistryUrl.query()
    return getRegistryEntry(modId || '', { baseURL: registryUrl })
  })

  useEffect(() => {
    index.mutate()
  }, [registryUrl.data])

  return {
    index
  }
}
