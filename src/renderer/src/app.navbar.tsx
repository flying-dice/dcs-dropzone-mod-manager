import { AppShell, Flex, useMantineTheme } from '@mantine/core'
import React from 'react'
import { AppNav } from './components/app-nav'
import { config } from './config'

export type AppNavbarProps = {}
export const AppNavbar: React.FC<AppNavbarProps> = ({}) => {
  const theme = useMantineTheme()

  return (
    <AppShell.Navbar style={{ background: theme.colors.dark[8] }}>
      <Flex flex={'auto'} justify={'space-between'} direction={'column'}>
        <AppNav items={config.navbar} />
        <AppNav items={config.navbarSecondary} />
      </Flex>
    </AppShell.Navbar>
  )
}
