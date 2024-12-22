import { describe, it, expect } from 'vitest'
import { posixpath } from './posixpath'

describe('posixpath', () => {
  it('converts backslashes to forward slashes', () => {
    const result = posixpath('C:\\path\\to\\file')
    expect(result).toBe('C:/path/to/file')
  })

  it('returns the same path if no backslashes are present', () => {
    const result = posixpath('C:/path/to/file')
    expect(result).toBe('C:/path/to/file')
  })

  it('handles empty string input', () => {
    const result = posixpath('')
    expect(result).toBe('')
  })

  it('handles paths with mixed slashes', () => {
    const result = posixpath('C:\\path/to\\file')
    expect(result).toBe('C:/path/to/file')
  })
})
