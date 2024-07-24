import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'

export const useFuse = <T>(
  items: T[],
  initialSearchTerm = '',
  keys = ['name', 'description', 'author']
): { search: string; results: T[]; setSearch: (search: string) => void } => {
  const [search, setSearch] = useState(initialSearchTerm)
  const fuse = useMemo(() => new Fuse(items, { keys, threshold: 0.6 }), [items])
  const results = useMemo(
    () => (search.length < 2 ? items : fuse.search(search).map((result) => result.item)),
    [items, fuse, search]
  )

  return { search, setSearch, results }
}
