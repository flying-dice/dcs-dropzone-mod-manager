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

  it('resolves immediately if delay is 0', async () => {
    const start = performance.now()
    await delay(0)
    const end = performance.now()
    expect(end - start).toBeLessThan(20)
  })

  it('handles negative delays as zero delay', async () => {
    const start = performance.now()
    await delay(-100)
    const end = performance.now()
    expect(end - start).toBeLessThan(20)
  })
})
