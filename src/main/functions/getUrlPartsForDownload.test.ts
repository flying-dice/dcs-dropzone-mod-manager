import { test, expect } from 'vitest'
import { getUrlPartsForDownload } from './getUrlPartsForDownload'

test('correctly splits a URL with hash routing into its parts', ({}) => {
  const url =
    'https://github.com/some-user/some-repo/releases/download/1.0/some-archive.zip/#/some-mod'
  const { baseUrl, file, hashRoute } = getUrlPartsForDownload(url)
  expect(baseUrl).toBe('https://github.com/some-user/some-repo/releases/download/1.0/')
  expect(file).toBe('some-archive.zip')
  expect(hashRoute).toBe('/some-mod')
})

test('returns undefined for hashRoute if no hash routing is present', ({}) => {
  const url = 'https://github.com/some-user/some-repo/releases/download/1.0/some-archive.zip'
  const { baseUrl, file, hashRoute } = getUrlPartsForDownload(url)
  expect(baseUrl).toBe('https://github.com/some-user/some-repo/releases/download/1.0/')
  expect(file).toBe('some-archive.zip')
  expect(hashRoute).toBeUndefined()
})

test('returns undefined for all parts if an empty string is passed', ({}) => {
  const url = ''
  expect(() => getUrlPartsForDownload(url)).toThrow()
})
