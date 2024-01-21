import { client } from '@renderer/client'
import { createContext, FC, ReactNode, useContext, useState } from 'react'
import { noop } from '@mantine/core'
import { EntryInstallMap, EntryInstallState } from 'src/client'
import useSwr from 'swr'

export interface InstallContextValue {
  installStates?: Record<string, string> 
  installMod: (githubPage: string, tag: string, installMapArr: EntryInstallMap[]) => void
  uninstallMod: (installMapArr: EntryInstallMap[]) => Promise<EntryInstallState>
  getInstallState: (installMapArr: EntryInstallMap[]) => Promise<EntryInstallState>
  clearProgress: () => void
}
export const InstallContext = createContext<InstallContextValue>({ installMod: noop,  uninstallMod: noop, getInstallState: noop, clearProgress:noop})
export const InstallProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const swrFn = () => client.installation.getInstallProgress.query();
  const query = useSwr<Awaited<ReturnType<typeof swrFn>>, any>("check", swrFn, {refreshInterval: 1000})

  const installMod = async (githubPage: string, tag: string, installMapArr: EntryInstallMap[]) => {
    client.installation.installMod.query({ githubPage: githubPage, tag: tag, installMapArr: installMapArr })
  }
  const uninstallMod = async (installMapArr: EntryInstallMap[]) => await client.installation.uninstallMod.query(installMapArr)
  const getInstallState = async(installMapArr: EntryInstallMap[]) => await client.installation.getInstallState.query(installMapArr)
  const clearProgress =async () => await client.installation.clearProgress.query()

  return (
    <InstallContext.Provider
      value={{
        installStates: query.data || {},
        installMod,
        uninstallMod,
        getInstallState,
        clearProgress
      }}
    >
      {children}
    </InstallContext.Provider>
  )
}
export const useInstallContext = (): InstallContextValue => useContext(InstallContext)
