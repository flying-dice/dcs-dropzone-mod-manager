import { LibraryPage } from './pages/library.page'
import { MyContentPage } from './pages/my-content.page'
import { RegistryEntryPage } from './pages/registry-entry.page'
import { SettingsPage } from './pages/settings.page'
import { FaDiscord, FaFile, FaGear, FaGithub, FaPatreon } from 'react-icons/fa6'
import { FaHome, FaList } from 'react-icons/fa'
import { LogsPage } from './pages/logs.page'
import { SiLua } from 'react-icons/si'
import { MissionScriptingPage } from './pages/mission-scripting.page'
import { useMissionScriptingFile } from './hooks/useMissionScriptingFile'
import { Indicator } from '@mantine/core'
import { MissionScriptingStatusCode } from '../../lib/mission-scripting'

function MissionScriptingLink() {
  const missionScripting = useMissionScriptingFile()

  return (
    <Indicator
      disabled={missionScripting.current?.status === MissionScriptingStatusCode.VALID}
      color={'red'}
      processing
    >
      <SiLua size={20} />
    </Indicator>
  )
}

export const config = {
  navbar: [
    {
      path: '/',
      tooltip: 'My Content',
      icon: <FaHome />
    },
    {
      path: '/library',
      tooltip: 'Library',
      icon: <FaList />
    },
    {
      path: '/mission-scripting',
      tooltip: 'Mission Scripting',
      icon: <MissionScriptingLink />
    },
    {
      path: '/settings',
      tooltip: 'Settings',
      icon: <FaGear />
    },
    {
      path: '/logs',
      tooltip: 'Logs',
      icon: <FaFile />
    }
  ],
  navbarSecondary: [
    {
      path: ' https://discord.gg/bT7BEHn5RD',
      tooltip: 'Discord',
      icon: <FaDiscord />,
      isExternal: true
    },

    {
      path: 'https://github.com/flying-dice/dcs-dropzone-mod-manager',
      tooltip: 'Github',
      icon: <FaGithub />,
      isExternal: true
    },
    {
      path: 'https://www.patreon.com/flyingdice',
      tooltip: 'Patreon',
      icon: <FaPatreon />,
      isExternal: true
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
    },
    {
      routerPath: '/logs',
      element: () => <LogsPage />
    },
    {
      routerPath: '/mission-scripting',
      element: () => <MissionScriptingPage />
    }
  ]
}
