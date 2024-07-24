import { AppShell } from '@mantine/core'
import type { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './app.header'
import { AppNavbar } from './app.navbar'
import { config } from './config'
import { DcsFoldersModal } from './modal/dcs-folders.modal'

export const App: FC = () => {
  return (
    <AppShell
      header={{ height: 66 }}
      navbar={{
        width: 44,
        breakpoint: 0
      }}
      padding="md"
    >
      <AppHeader />
      <AppNavbar />
      <DcsFoldersModal />
      <AppShell.Main>
        <Routes>
          {config.routes.map((route) => (
            <Route key={route.routerPath} path={route.routerPath} element={route.element()} />
          ))}
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}
