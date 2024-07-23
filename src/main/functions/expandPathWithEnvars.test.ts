import { describe, expect, test } from 'vitest'
import { expandPathWithEnvars } from './expandPathWithEnvars'

describe('When windows', () => {
  test('returns fully correctly expanded path', ({}) => {
    const path = '%APPDATA%\\Downloads'
    const expandedPath = expandPathWithEnvars(path)

    expect(expandedPath).toBe(`${process.env.APPDATA}\\Downloads`)
  })

  test('returns partially correctly expanded path', ({}) => {
    const path = '%APPDATA%\\Downloads\\%USERNAME%'
    const expandedPath = expandPathWithEnvars(path)

    expect(expandedPath).toBe(`${process.env.APPDATA}\\Downloads\\${process.env.USERNAME}`)
  })

  test('returns unchanged path if no environment variables are present', ({}) => {
    const path = 'C:\\Users\\some-user\\Downloads'
    const expandedPath = expandPathWithEnvars(path)

    expect(expandedPath).toBe(path)
  })
})

describe('When unix', () => {
  test('returns fully correctly expanded path', ({}) => {
    const path = '$APPDATA/Downloads'
    const expandedPath = expandPathWithEnvars(path)

    expect(expandedPath).toBe(`${process.env.APPDATA}/Downloads`)
  })

  test('returns partially correctly expanded path', ({}) => {
    const path = '$APPDATA/Downloads/$USERNAME'
    const expandedPath = expandPathWithEnvars(path)

    expect(expandedPath).toBe(`${process.env.APPDATA}/Downloads/${process.env.USERNAME}`)
  })

  test('returns unchanged path if no environment variables are present', ({}) => {
    const path = '/usr/tmp'
    const expandedPath = expandPathWithEnvars(path)

    expect(expandedPath).toBe(path)
  })
})
