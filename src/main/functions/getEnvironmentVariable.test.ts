import { describe, expect, it } from 'vitest'
import { getEnvironmentVariable } from './getEnvironmentVariable'

describe('getEnvironmentVariable', () => {
  it('returns the value of an existing environment variable', () => {
    process.env.TEST_VAR = 'test_value'
    const result = getEnvironmentVariable('TEST_VAR')
    expect(result).toBe('test_value')
  })

  it('returns undefined for a non-existing environment variable', () => {
    const result = getEnvironmentVariable('NON_EXISTENT_VAR')
    expect(result).toBeUndefined()
  })

  it('returns undefined for an environment variable with an empty string value', () => {
    process.env.EMPTY_VAR = ''
    const result = getEnvironmentVariable('EMPTY_VAR')
    expect(result).toBe('')
  })
})
