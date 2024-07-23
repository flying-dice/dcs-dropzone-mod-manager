import React from 'react'
import { AppNav } from './components/app-nav'
import { AppShell, useMantineTheme } from '@mantine/core'
import { config } from './config'

export type AppNavbarProps = {}
export const AppNavbar: React.FC<AppNavbarProps> = ({}) => {
  const theme = useMantineTheme()

  return (
    <AppShell.Navbar style={{ background: theme.colors.dark[8] }}>
      <AppNav items={config.navbar} />
    </AppShell.Navbar>
  )
}
