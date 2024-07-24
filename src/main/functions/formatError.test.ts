import { describe, it, expect } from 'vitest'
import { formatError } from './formatError'
import { NotFoundException } from '@nestjs/common'

describe('formatError', () => {
  it('should format a standard Error object correctly', () => {
    const error = new Error('Test error')
    const result = formatError(error)
    const expected = JSON.stringify({
      name: error.name,
      stack: error.stack,
      message: error.message,
      cause: error.cause // cause should be undefined
    })
    expect(result).toBe(expected)
  })

  it('should format a custom Error object with a cause correctly', () => {
    const cause = new Error('Cause error')
    const error = new Error('Test error')
    ;(error as any).cause = cause
    const result = formatError(error)
    const expected = JSON.stringify({
      name: error.name,
      stack: error.stack,
      message: error.message,
      cause: cause // assuming the cause is not serialized
    })
    expect(result).toBe(expected)
  })

  it('should handle Error object with missing properties', () => {
    const error = new Error('Test error')
    delete (error as any).stack
    const result = formatError(error)
    const expected = JSON.stringify({
      name: error.name,
      stack: undefined,
      message: error.message,
      cause: undefined
    })
    expect(result).toBe(expected)
  })

  it('should handle NestJS errors', () => {
    const notFoundError = new NotFoundException('Not found')
    const result = formatError(notFoundError)
    const expected = JSON.stringify({
      name: notFoundError.name,
      stack: notFoundError.stack,
      message: notFoundError.message,
      cause: notFoundError.cause
    })
    expect(result).toBe(expected)
  })
})
