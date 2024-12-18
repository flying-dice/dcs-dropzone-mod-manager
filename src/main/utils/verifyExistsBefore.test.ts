import { describe, expect, it } from 'vitest'
import { verifyExistsBefore } from './verifyExistsBefore'

describe('verifyExistsBefore', () => {
  it('returns true if the line exists before the specified line', () => {
    const content = 'line1\nline2\nline3'
    const line = 'line2'
    const before = 'line3'
    const result = verifyExistsBefore(content, line, before)
    expect(result).toBe(true)
  })

  it('returns false if the line does not exist before the specified line', () => {
    const content = 'line1\nline2\nline3'
    const line = 'line3'
    const before = 'line2'
    const result = verifyExistsBefore(content, line, before)
    expect(result).toBe(false)
  })

  it('returns false if the specified line does not exist in the content', () => {
    const content = 'line1\nline2\nline3'
    const line = 'line0'
    const before = 'line2'
    const result = verifyExistsBefore(content, line, before)
    expect(result).toBe(false)
  })

  it('returns false if the before line does not exist in the content', () => {
    const content = 'line1\nline2\nline3'
    const line = 'line2'
    const before = 'line4'
    const result = verifyExistsBefore(content, line, before)
    expect(result).toBe(false)
  })

  it('returns false if both the line and the before line do not exist in the content', () => {
    const content = 'line1\nline2\nline3'
    const line = 'line4'
    const before = 'line5'
    const result = verifyExistsBefore(content, line, before)
    expect(result).toBe(false)
  })
})
