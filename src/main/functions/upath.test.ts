import { describe, it, expect } from 'vitest'
import { upath } from './upath'

describe('upath', () => {
  it('converts backslashes to forward slashes', () => {
    const result = upath('C:\\path\\to\\file')
    expect(result).toBe('C:/path/to/file')
  })

  it('returns the same path if no backslashes are present', () => {
    const result = upath('C:/path/to/file')
    expect(result).toBe('C:/path/to/file')
  })

  it('handles empty string input', () => {
    const result = upath('')
    expect(result).toBe('')
  })

  it('handles paths with mixed slashes', () => {
    const result = upath('C:\\path/to\\file')
    expect(result).toBe('C:/path/to/file')
  })
})
