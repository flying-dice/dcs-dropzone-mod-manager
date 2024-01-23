import { AppShell, Divider, Group, Stack, Text, useMantineTheme } from '@mantine/core'
import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LibraryPage } from './pages/library.page'
import { SettingsPage } from './pages/settings.page'
import { AppNav, AppNavItem } from './components/app-nav'
import { HomePage } from './pages/home.page'
import { VscHome, VscLink, VscSearch, VscSettingsGear } from 'react-icons/vsc'
import { RegistryEntryPageLoader } from './pages/registry-entry.page'
import { GhProfile } from './container/gh-profile'
import { GhUserProvider } from './context/gh-user.context'
import { SettingsProvider } from './context/settings.context'
import { IntegrationsPage } from './pages/integrations.page'
import { InstallProvider } from './context/install.context'
import { Footer } from './components/footer'

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
    path: '/integrations',
    tooltip: 'Manage Integrations',
    icon: <VscLink />
  },
  {
    path: '/settings',
    tooltip: 'Settings',
    icon: <VscSettingsGear />
  }
]

export const App: FC = () => {
  const theme = useMantineTheme()
  return (
    <AppShell
      header={{ height: 66 }}
      navbar={{
        width: 44,
        breakpoint: 0
      }}
      aside={{
        width: 250,
        breakpoint: 0
      }}
      padding="md"
    >
      <GhUserProvider>
        <SettingsProvider>
          <InstallProvider>
            <AppShell.Header style={{ background: theme.colors.dark[8] }}>
              <Stack pl={'md'} h={'100%'} justify={'center'}>
                <Group justify={'space-between'}>
                  <Group>
                    <Text
                      style={{
                        fontSize: 'xx-large',
                        fontFamily: 'Doctor Glitch',
                        color: '#f59e0f'
                      }}
                    >
                      Dropzone
                    </Text>
                    <Divider orientation={'vertical'} />
                    <Text
                      style={{
                        fontFamily: 'Montserrat',
                        width: 250
                      }}
                    >
                      Community Mod Manager for DCS World
                    </Text>
                  </Group>
                  <GhProfile />
                </Group>
              </Stack>
            </AppShell.Header>
            <AppShell.Navbar style={{ background: theme.colors.dark[8] }}>
              <AppNav items={routes} />
            </AppShell.Navbar>
            <AppShell.Main>
              <Routes>
                <Route path={'/'} element={<HomePage />} />
                <Route path={'/library/:id'} element={<RegistryEntryPageLoader />} />
                <Route path={'/library'} element={<LibraryPage />} />
                <Route path={'/integrations'} element={<IntegrationsPage />} />
                <Route path={'/settings'} element={<SettingsPage />} />
              </Routes>
            </AppShell.Main>
            <Footer />
          </InstallProvider>
        </SettingsProvider>
      </GhUserProvider>
    </AppShell>
  )
}
