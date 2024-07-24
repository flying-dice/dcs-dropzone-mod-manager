import { VscHome, VscLibrary, VscSettingsGear } from 'react-icons/vsc'
import { LibraryPage } from './pages/library.page'
import { MyContentPage } from './pages/my-content.page'
import { RegistryEntryPage } from './pages/registry-entry.page'
import { SettingsPage } from './pages/settings.page'

export const config = {
  rcloneBaseUrl: 'http://127.0.0.1:5572',
  navbar: [
    {
      path: '/',
      tooltip: 'My Content',
      icon: <VscHome />
    },
    {
      path: '/library',
      tooltip: 'Library',
      icon: <VscLibrary />
    },
    {
      path: '/settings',
      tooltip: 'Settings',
      icon: <VscSettingsGear />
    }
  ],
  routes: [
    {
      routerPath: '/',
      element: () => <MyContentPage />
    },
    {
      routerPath: '/library/:id',
      element: () => <RegistryEntryPage />
    },
    {
      routerPath: '/library',
      element: () => <LibraryPage />
    },
    {
      routerPath: '/settings',
      element: () => <SettingsPage />
    }
  ]
}
