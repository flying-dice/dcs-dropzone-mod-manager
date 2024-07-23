import { MyContentPage } from './pages/my-content.page'
import { SettingsPage } from './pages/settings.page'
import { LibraryPage } from './pages/library.page'
import { RegistryEntryPage } from './pages/registry-entry.page'
import { VscHome, VscLibrary, VscSettingsGear } from 'react-icons/vsc'

export const config = {
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
