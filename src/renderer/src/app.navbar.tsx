import { AppShell, Flex, useMantineTheme } from '@mantine/core'
import React, { useEffect } from 'react'
import { AppNav } from './components/app-nav'
import { config } from './config'
import { useNavigate } from 'react-router-dom'
import { useObservable } from 'react-use'
import { deepLink$ } from './observables'

export type AppNavbarProps = {}
export const AppNavbar: React.FC<AppNavbarProps> = ({}) => {
  const navigate = useNavigate()
  const theme = useMantineTheme()

  const deepLinks = useObservable(deepLink$)

  useEffect(() => {
    console.log('Deep Links', deepLinks)
    if (deepLinks) {
      console.log('Navigating to', deepLinks)
      navigate(deepLinks)
    }
  }, [deepLinks])

  return (
    <AppShell.Navbar style={{ background: theme.colors.dark[8] }}>
      <Flex flex={'auto'} justify={'space-between'} direction={'column'}>
        <AppNav items={config.navbar} />
        <AppNav items={config.navbarSecondary} />
      </Flex>
    </AppShell.Navbar>
  )
}
