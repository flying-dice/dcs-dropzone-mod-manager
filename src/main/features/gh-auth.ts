import { trpc } from '../trpc'
import { BrowserWindow } from 'electron'
import { OAuthApp } from 'octokit'

export const authService = {
  getAccessToken: async (): Promise<string> => {
    console.log('Getting User GH Access Token')

    console.log('Creating new token')
    const redirectUrl = 'https://localhost/api/github/oauth/callback'
    const app = new OAuthApp({
      clientType: 'oauth-app',
      clientId: '0031f98d9f1fc12e6024',
      clientSecret: '13110a724cdfd961634ff30bf4b80c009ffba9a6',
      redirectUrl,
      allowSignup: true
    })

    console.log('Creating auth window')

    const code = await new Promise<string>((resolve, reject) => {
      const authWindow = new BrowserWindow({
        width: 800,
        height: 800,
        show: true,
        webPreferences: {
          nodeIntegration: false,
          sandbox: true,
          devTools: false,
          contextIsolation: true,
          partition: 'nopersist:' + new Date().getTime()
        }
      })
      authWindow.menuBarVisible = false

      const { url } = app.getWebFlowAuthorizationUrl({})

      authWindow.webContents.on('will-navigate', (_, url) => {
        if (url.startsWith(redirectUrl)) {
          const code = new URL(url).searchParams.get('code')

          if (code) {
            authWindow.destroy()
            resolve(code)
          }
        }
      })

      authWindow.webContents.on('will-redirect', (_, url) => {
        if (url.startsWith(redirectUrl)) {
          const code = new URL(url).searchParams.get('code')

          if (code) {
            authWindow.destroy()
            resolve(code)
          }
        }
      })

      authWindow.on('close', () => {
        reject(new Error('Auth window was closed'))
      })

      console.log('Loading auth window', url)
      authWindow.webContents.loadURL(url)
    })

    console.debug('Got code', code)
    if (!code) {
      throw new Error('No code')
    }

    console.log('Creating token with code', code)
    const { authentication } = await app.createToken({ code })

    console.log('Got token', authentication)
    return authentication.token
  }
}

export const authRouter = trpc.router({
  getAccessToken: trpc.procedure.query(authService.getAccessToken)
})
