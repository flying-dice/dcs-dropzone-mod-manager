import { client } from '@renderer/client'
import { createContext, FC, ReactNode, useContext } from 'react'
import { noop } from '@mantine/core'
import { EntryInstallMap, EntryInstallState } from 'src/client'
import useSwr from 'swr'

export interface InstallContextValue {
  installStates?: Record<string, string> 
  installMod: (modId: string, githubPage: string, tag: string, installMapArr: EntryInstallMap[]) => void
  uninstallMod: (modId: string, installMapArr: EntryInstallMap[]) => Promise<EntryInstallState>
  enableMod: (modId: string, installMapArr: EntryInstallMap[]) => Promise<EntryInstallState>
  disableMod: (modId: string, installMapArr: EntryInstallMap[]) => Promise<EntryInstallState>
  getInstallState: (modId: string, installMapArr: EntryInstallMap[]) => Promise<EntryInstallState>
  clearProgress: () => void
}
export const InstallContext = createContext<InstallContextValue>({ installMod: noop,  uninstallMod: noop, getInstallState: noop, clearProgress:noop, enableMod: noop, disableMod: noop})
export const InstallProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const swrFn = () => client.installation.getInstallProgress.query();
  const query = useSwr<Awaited<ReturnType<typeof swrFn>>, any>("check", swrFn, {refreshInterval: 1000})

  const installMod = async (modId: string, githubPage: string, tag: string, installMapArr: EntryInstallMap[]) => {
    client.installation.installMod.query({ modId,  githubPage,  tag, installMapArr })
  }
  const uninstallMod = async (modId: string, installMapArr: EntryInstallMap[]) => await client.installation.uninstallMod.query({modId,  installMapArr})
  const enableMod = async (modId: string, installMapArr: EntryInstallMap[]) => await client.installation.enableMod.query({modId,  installMapArr})
  const disableMod = async (modId: string, installMapArr: EntryInstallMap[]) => await client.installation.disableMod.query({modId,  installMapArr})
  const getInstallState = async(modId: string, installMapArr: EntryInstallMap[]) => await client.installation.getInstallState.query({modId,  installMapArr})
  const clearProgress =async () => await client.installation.clearProgress.query()

  return (
    <InstallContext.Provider
      value={{
        installStates: query.data || {},
        installMod,
        uninstallMod,
        enableMod,
        disableMod,
        getInstallState,
        clearProgress
      }}
    >
      {children}
    </InstallContext.Provider>
  )
}
export const useInstallContext = (): InstallContextValue => useContext(InstallContext)
