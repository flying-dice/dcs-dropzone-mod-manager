import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import { Octokit } from 'octokit'
import { Endpoints } from '@octokit/types'
import { LoadingOverlay, noop } from '@mantine/core'
import { client } from '../client'
import { showErrorNotification, showSuccessNotification } from '../utils/notifications'
import { useDisclosure } from '@mantine/hooks'
import { useAsync } from 'react-use'
import { GithubRegistryContentProvider } from '../providers/impl/GithubRegistryContentProvider'

const initialToken = window.localStorage.getItem('gh-token')

export type GhUserData = Endpoints['GET /user']['response']['data']

export interface GhUserContextValue {
  user?: GhUserData
  userToken?: string
  octokit?: Octokit
  login: () => void
  logout: () => void
}
export const GhUserContext = createContext<GhUserContextValue>({ login: noop, logout: noop })
export const GhUserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isBusy, busy] = useDisclosure()
  const [octokit, setOctokit] = useState<Octokit | undefined>(
    initialToken ? new Octokit({ auth: initialToken }) : undefined
  )
  const user = useAsync(async () => octokit?.request('GET /user').then((it) => it.data), [octokit])

  useEffect(() => {
    user.error && showErrorNotification(user.error)
  }, [user.error])

  useEffect(() => {
    GithubRegistryContentProvider.setOctokit(octokit)
  }, [octokit])

  const login = async () => {
    busy.open()
    try {
      const token = await client.auth.getAccessToken.query()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      window.localStorage.setItem('gh-token', token)
      showSuccessNotification('Successfully authenticated with GitHub')
      setOctokit(new Octokit({ auth: token }))
      busy.close()
    } catch (e) {
      showErrorNotification(e)
      setOctokit(undefined)
      GithubRegistryContentProvider.setOctokit(undefined)
    } finally {
      busy.close()
    }
  }

  const logout = () => {
    window.localStorage.removeItem('gh-token')
    setOctokit(undefined)
  }

  return (
    <GhUserContext.Provider
      value={{
        octokit,
        login,
        logout,
        user: user.value
      }}
    >
      <LoadingOverlay visible={isBusy || user.loading} overlayProps={{ blur: 2 }} />
      {children}
    </GhUserContext.Provider>
  )
}
export const useGhUser = (): GhUserContextValue => useContext(GhUserContext)
