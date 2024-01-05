import { createContext, FC, ReactNode, useContext } from 'react'
import { useLocalStorage } from '@mantine/hooks'
import { noop } from '@mantine/core'

export interface InstallationContextValue {
  writeDir: string
  setWriteDir: (writeDir: string) => void
}
export const InstallationContext = createContext<InstallationContextValue>({
  writeDir: '',
  setWriteDir: noop
})

export const InstallationProvider: FC<{ defaultWriteDir: string; children: ReactNode }> = ({
  defaultWriteDir,
  children
}) => {
  const [writeDir, setWriteDir] = useLocalStorage({
    key: 'installation-writedir',
    defaultValue: defaultWriteDir
  })

  return (
    <InstallationContext.Provider
      value={{
        writeDir,
        setWriteDir
      }}
    >
      {children}
    </InstallationContext.Provider>
  )
}

export const useInstallation = (): InstallationContextValue => useContext(InstallationContext)
