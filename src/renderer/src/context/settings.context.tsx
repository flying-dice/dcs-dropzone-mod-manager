import { createContext, FC, ReactNode, useContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { config } from '../config'
import { client } from '../client'
import { useAsync } from 'react-use'
import { LoadingOverlay } from '@mantine/core'

export class Settings {
  registryUrl: string

  writeDir: string

  constructor({ registryUrl, writeDir }: Pick<Settings, 'registryUrl' | 'writeDir'>) {
    makeAutoObservable(this)
    this.registryUrl = registryUrl
    this.writeDir = writeDir
  }

  static async fromLocalStorage() {
    const registryUrl = localStorage.getItem('registry-url') || config.defaultRegistryUrl
    const writeDir =
      localStorage.getItem('write-dir') ||
      (await client.installation.getDefaultWriteDir.query().then((it) => it.path))

    if (!registryUrl || !writeDir) {
      throw new Error('Could not load settings from local storage')
    }

    return new Settings({ writeDir, registryUrl })
  }

  setRegistryUrl(url: string) {
    this.registryUrl = url
    localStorage.setItem('registry-url', url)
  }

  setWriteDir(dir: string) {
    this.writeDir = dir
    localStorage.setItem('write-dir', dir)
  }
}

export const SettingsContext = createContext<Settings>(
  new Settings({ registryUrl: '', writeDir: '' })
)
export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const settings = useAsync(async () => Settings.fromLocalStorage(), [])

  return (
    <>
      <LoadingOverlay visible={settings.loading} overlayProps={{ blur: 2 }} />
      {settings.value && (
        <SettingsContext.Provider value={settings.value}>{children}</SettingsContext.Provider>
      )}
    </>
  )
}
export const useSettings = () => useContext(SettingsContext)
