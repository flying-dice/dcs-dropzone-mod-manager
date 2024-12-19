import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initialize } from '@aptabase/electron/main'
import { initalizeAptabase } from './initalizeAptabase'
import { Logger } from '@nestjs/common'

vi.mock('@aptabase/electron/main', () => ({
  initialize: vi.fn()
}))

vi.mock('@nestjs/common', () => ({
  Logger: {
    log: vi.fn(),
    warn: vi.fn()
  }
}))

describe('initalizeAptabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes Aptabase when app key is provided', async () => {
    await initalizeAptabase({ MAIN_VITE_APTABASE_APP_KEY: 'A-EU-123' })
    expect(initialize).toHaveBeenCalledWith('A-EU-123')
    expect(Logger.log).toHaveBeenCalledWith('Aptabase initialized A-EU-***', 'initalizeAptabase')
  })

  it('skips initialization when no app key is provided', async () => {
    await initalizeAptabase({})
    expect(initialize).not.toHaveBeenCalled()
  })

  it('skips initialization when empty app key is provided', async () => {
    await initalizeAptabase({ MAIN_VITE_APTABASE_APP_KEY: '' })
    expect(initialize).not.toHaveBeenCalled()
  })
})
