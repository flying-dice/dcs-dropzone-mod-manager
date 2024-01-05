import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'

export const useFuse = <T>(
  items: T[],
  initialSearchTerm = ''
): { search: string; results: T[]; setSearch: (search: string) => void } => {
  const [search, setSearch] = useState(initialSearchTerm)
  const fuse = useMemo(
    () => new Fuse(items, { keys: ['name', 'description', 'author'], threshold: 0.6 }),
    [items]
  )
  const results = useMemo(
    () => (search.length < 2 ? items : fuse.search(search).map((result) => result.item)),
    [items, fuse, search]
  )
  return { search, setSearch, results }
}
