import { describe, expect, it, vi } from 'vitest'
import { Logger } from '@nestjs/common'
import { trackEvent } from '@aptabase/electron/main'
import { onUnhandledRejection } from './onUnhandledRejection'

vi.mock('@aptabase/electron/main', () => ({
  trackEvent: vi.fn()
}))

vi.mock('@nestjs/common', () => ({
  Logger: {
    flush: vi.fn(),
    error: vi.fn()
  }
}))

describe('onUnhandledRejection', () => {
  it('tracks event with error details when reason is an Error', async () => {
    const error = new Error('Test error')
    await onUnhandledRejection(error)
    expect(trackEvent).toHaveBeenCalledWith('unhandled_rejection', {
      name: error.name,
      message: error.message
    })
  })

  it('tracks event with string details when reason is not an Error', async () => {
    const reason = 'Test reason'
    await onUnhandledRejection(reason)
    expect(trackEvent).toHaveBeenCalledWith('unhandled_rejection', {
      name: 'Non Error UnhandledRejection',
      message: reason
    })
  })

  it('logs error message when reason is an Error', async () => {
    const error = new Error('Test error')
    await onUnhandledRejection(error)
    expect(Logger.error).toHaveBeenCalledWith(`Unhandled Rejection: ${error.toString()}`, 'main')
  })

  it('logs error message when reason is not an Error', async () => {
    const reason = 'Test reason'
    await onUnhandledRejection(reason)
    expect(Logger.error).toHaveBeenCalledWith(`Unhandled Rejection: ${reason.toString()}`, 'main')
  })
})
