import { client } from '../client'
import useSwr from 'swr'
import { useGetRegistryEntry, useGetRegistryEntryLatestRelease } from '../../../client'
import { useEffect } from 'react'

export const useRegistryEntry = (modId: string) => {
  const url = useSwr('registryUrl', () => client.settings.getRegistryUrl.query())
  const index = useGetRegistryEntry(modId || '', { axios: { baseURL: url.data } })
  const latestRelease = useGetRegistryEntryLatestRelease(modId || '', {
    axios: { baseURL: url.data }
  })

  useEffect(() => {
    index.mutate()
    latestRelease.mutate()
  }, [url.data])

  return {
    url,
    index,
    latestRelease
  }
}
