import { RegistryEntry } from '../schema/registryEntriesSchema'
import { useMemo } from 'react'
import { getRegistryEntryContentProvider } from '../providers/RegistryContentProvider'

/**
 * Returns a memoized content provider for the given registry entry.
 *
 * @param {RegistryEntry} entry - The registry entry for which to retrieve the content provider.
 */
export const useRegistryEntryContentProvider = (entry: RegistryEntry) =>
  useMemo(() => getRegistryEntryContentProvider(entry), [entry])
