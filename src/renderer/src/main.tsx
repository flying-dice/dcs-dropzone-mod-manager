import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/code-highlight/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/index.css'
import { createTheme, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import '@fontsource/montserrat/600-italic.css'
import { trackEvent } from '@aptabase/electron/renderer'

trackEvent('app_rendered')

const theme = createTheme({
  components: {
    Tooltip: {
      defaultProps: {
        openDelay: 500
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider forceColorScheme={'dark'} theme={theme}>
      <ModalsProvider>
        <Notifications />
        <HashRouter>
          <App />
        </HashRouter>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
)
