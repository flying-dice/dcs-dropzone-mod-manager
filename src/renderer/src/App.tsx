import { Alert, AppShell, LoadingOverlay, useMantineTheme } from '@mantine/core'
import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './app.header'
import { AppNavbar } from './app.navbar'
import { config } from './config'
import { DcsFoldersModal } from './modal/dcs-folders.modal'
import { useMount } from 'react-use'
import { openConfirmModal } from '@mantine/modals'
import { LegalDisclaimer } from './components/legal-disclaimer'
import { trackEvent } from '@aptabase/electron/renderer'
import useSWR from 'swr'
import { client } from './client'

export function App() {
  const theme = useMantineTheme()
  useMount(() => {
    const acceptedLegalDisclaimer = localStorage.getItem('accepted_legal')
    if (!acceptedLegalDisclaimer) {
      openConfirmModal({
        closeOnCancel: false,
        closeOnEscape: false,
        closeOnClickOutside: false,
        withCloseButton: false,
        closeOnConfirm: true,
        overlayProps: { blur: 10 },
        size: 'xl',
        children: <LegalDisclaimer />,
        labels: { confirm: 'I Agree', cancel: 'Decline' },
        onCancel: async () => {
          await trackEvent('legal_disclaimer_declined')
          window.close()
        },
        onConfirm: async () => {
          await trackEvent('legal_disclaimer_accepted')
          localStorage.setItem('accepted_legal', 'true')
        }
      })
    }
  })

  const { data, error, isLoading } = useSWR('settings', () => client.getSettings.query())

  return (
    <AppShell
      header={{ height: 66 }}
      navbar={{
        width: 44,
        breakpoint: 0
      }}
      padding="md"
    >
      <LoadingOverlay visible={isLoading} />
      <AppHeader />
      <AppNavbar />
      <DcsFoldersModal />
      <AppShell.Main bg={theme.colors.dark[8]}>
        {data && (
          <Routes>
            {config.routes.map((route) => (
              <Route key={route.routerPath} path={route.routerPath} element={route.element()} />
            ))}
          </Routes>
        )}
        {error && <Alert title={'Failed to load settings'}>{error.toString()}</Alert>}
      </AppShell.Main>
    </AppShell>
  )
}
