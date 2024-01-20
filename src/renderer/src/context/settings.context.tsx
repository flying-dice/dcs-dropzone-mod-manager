import { createContext, FC, ReactNode, useContext } from "react";
import { makeAutoObservable } from "mobx";
import { config } from "../config";
import { client } from "../client";
import { useAsync } from "react-use";
import { Alert, List, LoadingOverlay } from "@mantine/core";

class SettingsError extends Error {
  errors: string[]

  constructor(message: string, errors: string[] = []) {
    super(message)
    this.errors = errors
  }
}

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
      const error = new SettingsError('Could not load settings from local storage.')
      if (!registryUrl) {
        error.errors.push('Registry url could not be loaded.')
      }
      if (!writeDir) {
        error.errors.push('Write directory could not be loaded.')
      }
      throw error
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
      <LoadingOverlay
        visible={Boolean(settings.loading || settings.error)}
        overlayProps={{ blur: 2 }}
        loaderProps={{
          children: settings.error && (
            <Alert color={'red'} title={'Could not load settings'}>
              {settings.error.message}
              <List>
                {(settings.error as SettingsError).errors.map((it) => (
                  <List.Item key={it}>{it}</List.Item>
                ))}
              </List>
            </Alert>
          )
        }}
      />
      {settings.value && (
        <SettingsContext.Provider value={settings.value}>{children}</SettingsContext.Provider>
      )}
    </>
  )
}
export const useSettings = () => useContext(SettingsContext)
