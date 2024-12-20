import { describe, expect, it, vi } from 'vitest'
import { Logger } from '@nestjs/common'
import { trackEvent } from '@aptabase/electron/main'
import { onUncaughtException } from './onUncaughtException'
import { showError } from '../utils/show-error'
import { filename } from '../logging'
import { readFile } from 'fs-extra'

vi.mock('@aptabase/electron/main', () => ({
  trackEvent: vi.fn()
}))

vi.mock('../logging', () => ({
  filename: 'test.log',
  fileTransport: {
    filename: 'test.log'
  }
}))

vi.mock('@nestjs/common', () => ({
  Logger: {
    flush: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('fs-extra', () => ({
  readFile: vi.fn()
}))

vi.mock('../utils/show-error', () => ({
  showError: vi.fn()
}))

describe('onUncaughtException', () => {
  it('logs error, tracks event, and shows error with recent logs when error is provided', async () => {
    const error = new Error('Test error')
    vi.mocked(readFile).mockResolvedValue(
      Buffer.from('log1\nlog2\nlog3\nlog4\nlog5\nlog6\nlog7\nlog8\nlog9\nlog10')
    )

    await onUncaughtException(error)

    expect(Logger.flush).toHaveBeenCalled()
    expect(readFile).toHaveBeenCalledWith(filename)
    expect(trackEvent).toHaveBeenCalledWith('uncaught_exception', {
      name: error.name,
      message: error.message
    })
    expect(showError).toHaveBeenCalledWith(error, [
      'log1',
      'log2',
      'log3',
      'log4',
      'log5',
      'log6',
      'log7',
      'log8',
      'log9',
      'log10'
    ])
  })

  it('logs error, tracks event, and shows error with recent logs when non-error is provided', async () => {
    const nonError = 'Test non-error'
    vi.mocked(readFile).mockResolvedValue(
      Buffer.from('log1\nlog2\nlog3\nlog4\nlog5\nlog6\nlog7\nlog8\nlog9\nlog10')
    )

    await onUncaughtException(nonError)

    expect(Logger.flush).toHaveBeenCalled()
    expect(readFile).toHaveBeenCalledWith(filename)
    expect(trackEvent).toHaveBeenCalledWith('uncaught_exception', {
      name: undefined,
      message: undefined
    })
    expect(showError).toHaveBeenCalledWith(nonError, [
      'log1',
      'log2',
      'log3',
      'log4',
      'log5',
      'log6',
      'log7',
      'log8',
      'log9',
      'log10'
    ])
  })
})
