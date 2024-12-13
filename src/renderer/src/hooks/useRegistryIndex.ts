import useSWR from 'swr'
import { client } from '../client'

export const useRegistryIndex = () => {
  const index = useSWR('registry/index', () => client.getRegistryIndex.query())

  const allAuthors = index?.data?.flatMap((it) =>
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
