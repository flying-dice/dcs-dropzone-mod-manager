import { describe, it, expect } from 'vitest'
import { delay } from './delay'

describe('delay', () => {
  it('resolves after the specified delay', async () => {
    const start = performance.now()
    await delay(1000)
    const end = performance.now()
    expect(end - start).toBeLessThan(1050)
    expect(end - start).toBeGreaterThan(950)
  })
})
