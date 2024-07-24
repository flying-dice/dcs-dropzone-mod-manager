import { useEffect } from 'react'
import useSWR from 'swr'
import { getRegistryIndex } from '../../../lib/client'
import { client } from '../client'
import { useRegistryUrl } from './useRegistryUrl'

export const useRegistryIndex = () => {
  const registryUrl = useRegistryUrl()

  const index = useSWR('registry/index', async () => {
    const registryUrl = await client.getRegistryUrl.query()
    return getRegistryIndex({ baseURL: registryUrl })
  })

  useEffect(() => {
    index.mutate()
  }, [registryUrl.data])

  const allAuthors = index?.data?.data.flatMap((it) =>
    it.authors.map((author) => {
      if (typeof author === 'string') {
        return { value: author, label: author }
      } else {
        return { value: author.name, label: author.name }
      }
    })
  )

  return {
    index,
    allAuthors
  }
}
