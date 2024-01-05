import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/index.css'
import { App } from './App'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { HashRouter } from 'react-router-dom'
import { client } from './client'

client.installation.getDefaultWriteDir.query().then((defaultWriteDir) => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <MantineProvider forceColorScheme={'dark'}>
        <ModalsProvider>
          <Notifications />
          <HashRouter>
            <App defaultWriteDir={defaultWriteDir.path} />
          </HashRouter>
        </ModalsProvider>
      </MantineProvider>
    </React.StrictMode>
  )
})
