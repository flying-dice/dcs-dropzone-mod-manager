import { client } from '../client'
import useSwr from 'swr'
import { useGetRegistryIndex } from '../../../lib/client'
import { useEffect } from 'react'

export const useRegistry = () => {
  const url = useSwr('registryUrl', () => client.getRegistryUrl.query())
  const index = useGetRegistryIndex({ axios: { baseURL: url.data } })

  useEffect(() => {
    index.mutate()
  }, [url.data])

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
    url,
    index,
    allAuthors
  }
}
