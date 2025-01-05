import { showError } from './show-error'
import { dialog, shell } from 'electron'
import { Logger } from '@nestjs/common'
import { vi } from 'vitest'

vi.mock('electron', () => ({
  dialog: { showErrorBox: vi.fn() },
  shell: { openExternal: vi.fn() }
}))

vi.mock('@nestjs/common', () => ({
  Logger: { error: vi.fn() }
}))

vi.mock('../logging', () => ({
  filename: 'test.log'
}))

describe('showError', () => {
  const error = new Error('Test error')
  error.stack = 'Error: Test error\n    at testFunction (test.js:1:1)'

  const recentLogs = ['log1', 'log2']

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('displays an error dialog with the correct title and message', () => {
    showError(error, recentLogs)
    expect(dialog.showErrorBox).toHaveBeenCalledWith(
      'Oops! Something Went Wrong',
      expect.stringContaining('An unexpected error occurred.')
    )
  })

  it('should generate an error report matching snapshot', () => {
    showError(error, recentLogs)
    expect(shell.openExternal).toHaveBeenCalled()
    expect(Logger.error).toHaveBeenCalled()
    const issueBody = decodeURIComponent(
      vi.mocked(shell.openExternal).mock.calls[0][0].split('body=')[1]
    )
    expect(issueBody).toMatchSnapshot()

    const dialogBoxContent = vi.mocked(dialog.showErrorBox).mock.calls[0][1]
    expect(dialogBoxContent).toMatchSnapshot()
  })

  it('opens the GitHub issue URL with the correct parameters', () => {
    showError(error, recentLogs)
    expect(shell.openExternal).toHaveBeenCalledWith(
      expect.stringContaining('https://github.com/flying-dice/dcs-dropzone-mod-manager/issues/new')
    )
  })

  it('logs the error using the Logger', () => {
    showError(error, recentLogs)
    expect(Logger.error).toHaveBeenCalledWith(error, 'main')
  })

  it('handles empty recentLogs array', () => {
    showError(error, [])
    expect(dialog.showErrorBox).toHaveBeenCalled()
    expect(shell.openExternal).toHaveBeenCalled()
    expect(Logger.error).toHaveBeenCalled()
  })

  it('handles error with no stack trace', () => {
    const errorWithoutStack = new Error('Test error')
    errorWithoutStack.stack = ''
    showError(errorWithoutStack, recentLogs)
    expect(dialog.showErrorBox).toHaveBeenCalled()
    expect(shell.openExternal).toHaveBeenCalled()
    expect(Logger.error).toHaveBeenCalled()
  })
})
