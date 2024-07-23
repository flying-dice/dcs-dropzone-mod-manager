import * as path from 'node:path'

/**
 * Breaks apart a File URL with hash routing into its parts.
 *
 * @example
 *
 * ```ts
 *  const url =
 *     'https://github.com/some-user/some-repo/releases/download/1.0/some-archive.zip/#/some-mod'
 *   const { baseUrl, file, hashRoute } = getUrlPartsForDownload(url)
 *   expect(baseUrl).toBe('https://github.com/some-user/some-repo/releases/download/1.0/')
 *   expect(file).toBe('some-archive.zip')
 *   expect(hashRoute).toBe('/some-mod')
 * ```
 *
 * @param source {string} The URL to break apart
 */
export const getUrlPartsForDownload = (source: string) => {
  const [assetUrl, hashRoute] = source.split('/#')
  if (!assetUrl) {
    throw new Error(`Invalid URL ${source}`)
  }
  const file = path.basename(assetUrl)
  return { baseUrl: assetUrl.replace(file, ''), file, hashRoute }
}
