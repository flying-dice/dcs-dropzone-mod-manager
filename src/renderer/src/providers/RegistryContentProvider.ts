import { RegistryEntry } from '../schema/registryEntriesSchema'
import { match } from 'ts-pattern'
import { GithubRegistryContentProvider } from './impl/GithubRegistryContentProvider'

export type Releases = Array<Release>

export type Asset = { name: string; downloadUrl: string; size: number }
export type Release = {
  htmlUrl: string
  tag: string
  name: string
  created: string
  assets: Asset[]
}

export type Meta = {
  url: string
  license?: string
  stars: number
  description?: string
  topics?: string[]
}

/**
 * Represents a content provider for a registry entry.
 */
export interface RegistryContentProvider {
  getMeta(): Promise<Meta>
  /**
   * Retrieves the content of the README file.
   *
   * @returns {Promise<string>} A Promise that resolves with the contents of the README file as a string.
   */
  getReadme(): Promise<string>

  /**
   * Retrieves the latest release from a repository.
   *
   * @returns {Promise<{ htmlUrl: string; tag: string; name: string }>} The latest release with its details.
   */
  getLatestRelease(): Promise<Release>

  /**
   * Retrieves the releases from a repository.
   *
   * @returns {Promise<Array<{ htmlUrl: string; tag: string; name: string }>>} The list of releases with their details.
   */
  getReleases(): Promise<Releases>
}

/**
 * Factory function to determine the content provider for a given registry entry.
 *
 * Currently only GitHub is supported.
 *
 * @param {RegistryEntry} registryEntry - The registry entry to determine the content provider.
 * @returns {RegistryContentProvider} - The determined registry content provider.
 * @throws {Error} If the registry URL of the given entry is unknown.
 */
export const getRegistryEntryContentProvider = (
  registryEntry: RegistryEntry
): RegistryContentProvider =>
  match(registryEntry)
    .when(
      (it) => it.url.startsWith('https://github.com/'),
      (it) => GithubRegistryContentProvider.fromRepoUrl(it.url)
    )
    .otherwise(() => {
      throw new Error('Unknown registry URL')
    })
