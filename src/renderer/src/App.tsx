import { AppShell, LoadingOverlay, Stack, Title } from '@mantine/core'
import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LibraryPage } from './pages/library.page'
import { SettingsPage } from './pages/settings.page'
import { AppNav, AppNavItem } from './components/app-nav'
import { HomePage } from './pages/home.page'
import { VscHome, VscSearch, VscSettingsGear } from 'react-icons/vsc'
import { client } from './client'
import { useAsync } from 'react-use'

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
  const defaultInstallationFolder = useAsync(
    () => client.installation.getDefaultInstallFolder.query(),
    []
  )

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
          <Title order={3}>DCS Mod Manager</Title>
        </Stack>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppNav items={routes} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path={'/'} element={<HomePage />} />
          <Route path={'/library'} element={<LibraryPage />} />
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
