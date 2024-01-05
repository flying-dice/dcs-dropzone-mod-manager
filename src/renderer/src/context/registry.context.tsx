import { RegistryEntries } from '../schema/registryEntriesSchema'
import { createContext, FC, ReactNode, useContext } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { config } from '../config'
import { useAsync } from 'react-use'
import axios from 'axios'
import { LoadingOverlay, noop } from '@mantine/core'
import { showErrorNotification } from '../utils/notifications'

export interface RegistryContextValue {
  url: string
  setUrl: (url: string) => void
  entries: RegistryEntries
}
export const RegistryContext = createContext<RegistryContextValue>({
  url: '',
  setUrl: noop,
  entries: []
})

export const RegistryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [url, setUrl] = useLocalStorage({
    key: 'registry-url',
    defaultValue: config.defaultRegistryUrl
  })

  const registryEntries = useAsync(
    async () =>
      axios
        .get<RegistryEntries>('/registry.json', { baseURL: url })
        .then((response) => response.data)
        .catch((error) => {
          error.title = 'Registry Error'
          showErrorNotification(error)
        }),
    [url]
  )

  return (
    <RegistryContext.Provider
      value={{
        url,
        setUrl,
        entries: registryEntries.value || []
      }}
    >
      <LoadingOverlay visible={registryEntries.loading} overlayProps={{ blur: 2 }} />
      {children}
    </RegistryContext.Provider>
  )
}

export const useRegistry = (): RegistryContextValue => useContext(RegistryContext)
