import { describe, expect, it } from 'vitest'
import { winpath } from './winpath'

describe('winpath', () => {
  it('converts forward slashes to backslashes', () => {
    const result = winpath('C:/path/to/file')
    expect(result).toBe('C:\\path\\to\\file')
  })

  it('returns the same path if no backslashes are present', () => {
    const result = winpath('C:\\path\\to\\file')
    expect(result).toBe('C:\\path\\to\\file')
  })

  it('handles empty string input', () => {
    const result = winpath('')
    expect(result).toBe('')
  })

  it('handles paths with mixed slashes', () => {
    const result = winpath('C:\\path/to\\file')
    expect(result).toBe('C:\\path\\to\\file')
  })
})
