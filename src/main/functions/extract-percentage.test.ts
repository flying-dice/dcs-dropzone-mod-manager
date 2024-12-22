import { describe, expect, it } from 'vitest'
import { extractPercentage } from './extract-percentage'

describe('extractPercentage', () => {
  it('returns the percentage as a rounded number when input contains a percentage', () => {
    const input = 'The completion rate is 75.5%'
    const result = extractPercentage(input)
    expect(result).toBe(76)
  })

  it('returns undefined when input does not contain a percentage', () => {
    const input = 'No percentage here'
    const result = extractPercentage(input)
    expect(result).toBeUndefined()
  })

  it('returns the first percentage found when input contains multiple percentages', () => {
    const input = 'First 20%, then 30%'
    const result = extractPercentage(input)
    expect(result).toBe(30)
  })

  it('returns undefined when input is an empty string', () => {
    const input = ''
    const result = extractPercentage(input)
    expect(result).toBeUndefined()
  })

  it('returns the percentage as a rounded number when input contains a whole number percentage', () => {
    const input = 'The completion rate is 50%'
    const result = extractPercentage(input)
    expect(result).toBe(50)
  })
})
