import { AppShell, LoadingOverlay, Stack, Title } from '@mantine/core'
import { FC, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LibraryPage } from './pages/library.page'
import { SettingsPage } from './pages/settings.page'
import { AppNav, AppNavItem } from './components/app-nav'
import { HomePage } from './pages/home.page'
import { VscHome, VscSearch, VscSettingsGear } from 'react-icons/vsc'
import { client } from './client'
import { useAsync } from 'react-use'
import useSWR from 'swr'
import axios from 'axios'
import { useLocalStorage } from '@mantine/hooks'
import { showErrorNotification } from './utils/notifications'

const routes: AppNavItem[] = [
  {
    path: '/',
    tooltip: 'Home',
    icon: <VscHome />
  },
  {
    path: '/library',
    tooltip: 'Library',
    icon: <VscSearch />
  },
  {
    path: '/settings',
    tooltip: 'Settings',
    icon: <VscSettingsGear />
  }
]

export const App: FC = () => {
  const [registry] = useLocalStorage({
    key: 'registry',
    defaultValue: 'https://dcs-mod-manager-registry.pages.dev/'
  })

  const defaultInstallationFolder = useAsync(
    () => client.installation.getDefaultInstallFolder.query(),
    []
  )

  const { data, error } = useSWR('registry', () =>
    axios.get('/registry.json', { baseURL: registry }).then((response) => response.data)
  )

  useEffect(() => {
    error && showErrorNotification(error)
  }, [error])

  return (
    <AppShell
      header={{ height: 44 }}
      navbar={{
        width: 44,
        breakpoint: 0
      }}
      padding="md"
    >
      <LoadingOverlay visible={defaultInstallationFolder.loading} />
      <AppShell.Header>
        <Stack pl={'sm'} h={'100%'} justify={'center'}>
          <Title order={3}>DCS World Mod Manager</Title>
        </Stack>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppNav items={routes} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path={'/'} element={<HomePage />} />
          <Route path={'/library'} element={<LibraryPage registry={data} />} />
          {defaultInstallationFolder.value && (
            <Route
              path={'/settings'}
              element={
                <SettingsPage defaultInstallationFolder={defaultInstallationFolder.value.path} />
              }
            />
          )}
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}
