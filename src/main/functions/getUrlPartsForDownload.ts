import * as path from 'node:path'

/**
 * Breaks apart a File URL with hash routing into its parts.
 *
 * @example
 *
 * ```ts
 *  const url =
 *     'https://github.com/some-user/some-repo/releases/download/1.0/some-archive.zip'
 *   const { baseUrl, file } = getUrlPartsForDownload(url)
 *   expect(baseUrl).toBe('https://github.com/some-user/some-repo/releases/download/1.0/')
 *   expect(file).toBe('some-archive.zip')
 * ```
 *
 * @param source {string} The URL to break apart
 */
export const getUrlPartsForDownload = (source: string) => {
  if (!source) {
    throw new Error(`Invalid URL ${source}`)
  }
  const file = path.basename(source)
  return { baseUrl: source.replace(file, ''), file }
}
