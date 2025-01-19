/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * DCS Dropzone Registry
 * DCS Dropzone Registry API
 * OpenAPI spec version: 1.0.0
 */
import * as axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import useSwr from 'swr'
import type { Key, SWRConfiguration } from 'swr'
export type EntryIndexVersionsItemAssetsItem = {
  /** download path */
  remoteSource: string
  /** list of symlinks to be created when enabled */
  links: {
    /** Source path for symlink */
    source?: string
    /** Target path for symlink */
    target?: string
    /** Run on simulation (mission) start, note that this will execute the script before the mission environment is sanitized */
    runonstart?: boolean
  }[]
}

export type EntryIndexVersionsItem = {
  /** The array of files to install */
  assets: EntryIndexVersionsItemAssetsItem[]
  /** The date of the release */
  date: string
  /** Executable file specifically Tools */
  exePath?: string
  /** The name of the release */
  name?: string
  /** The release page of the release */
  releasepage: string
  /** The version of the release */
  version?: string
}

export type EntryIndexAuthorsItem = {
  avatar?: string
  name: string
  url?: string
}

export interface EntryIndex {
  authors: EntryIndexAuthorsItem[]
  /** The category of the mod, this is used to group mods in the mod browser */
  category?: string
  content: string
  /** A short description of the mod to be displayed in the mod tile */
  description?: string
  /** The homepage of the mod */
  homepage: string
  /** @pattern ^[a-z0-9-]+$ */
  id: string
  imageUrl: string
  latest?: string
  /** The license of the mod */
  license?: string
  /** The name of the mod */
  name?: string
  /** The tags of the mod, these are used to filter mods in the mod browser */
  tags: string[]
  /** Mod Ids this mod is dependent on */
  dependencies?: string[]
  /** The versions of the mod */
  versions: EntryIndexVersionsItem[]
}

export type RegistryIndexItemAuthorsItem = {
  avatar?: string
  name: string
  url?: string
}

export type RegistryIndexItem = {
  authors: RegistryIndexItemAuthorsItem[]
  /** The category of the mod, this is used to group mods in the mod browser */
  category?: string
  /** A short description of the mod to be displayed in the mod tile */
  description?: string
  /** @pattern ^[a-z0-9-]+$ */
  id: string
  imageUrl: string
  latest?: string
  /** The name of the mod */
  name?: string
  /** The tags of the mod, these are used to filter mods in the mod browser */
  tags: string[]
}

export type RegistryIndex = RegistryIndexItem[]

/**
 * @summary Get Registry Index
 */
export const getRegistryIndex = (
  options?: AxiosRequestConfig
): Promise<AxiosResponse<RegistryIndex>> => {
  return axios.default.get(`/index.json`, options)
}

export const getGetRegistryIndexKey = () => [`/index.json`] as const

export type GetRegistryIndexQueryResult = NonNullable<Awaited<ReturnType<typeof getRegistryIndex>>>
export type GetRegistryIndexQueryError = AxiosError<unknown>

/**
 * @summary Get Registry Index
 */
export const useGetRegistryIndex = <TError = AxiosError<unknown>>(options?: {
  swr?: SWRConfiguration<Awaited<ReturnType<typeof getRegistryIndex>>, TError> & {
    swrKey?: Key
    enabled?: boolean
  }
  axios?: AxiosRequestConfig
}) => {
  const { swr: swrOptions, axios: axiosOptions } = options ?? {}

  const isEnabled = swrOptions?.enabled !== false
  const swrKey = swrOptions?.swrKey ?? (() => (isEnabled ? getGetRegistryIndexKey() : null))
  const swrFn = () => getRegistryIndex(axiosOptions)

  const query = useSwr<Awaited<ReturnType<typeof swrFn>>, TError>(swrKey, swrFn, swrOptions)

  return {
    swrKey,
    ...query
  }
}

/**
 * @summary Get Registry Entry
 */
export const getRegistryEntry = (
  id: string,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<EntryIndex>> => {
  return axios.default.get(`/${id}/index.json`, options)
}

export const getGetRegistryEntryKey = (id: string) => [`/${id}/index.json`] as const

export type GetRegistryEntryQueryResult = NonNullable<Awaited<ReturnType<typeof getRegistryEntry>>>
export type GetRegistryEntryQueryError = AxiosError<unknown>

/**
 * @summary Get Registry Entry
 */
export const useGetRegistryEntry = <TError = AxiosError<unknown>>(
  id: string,
  options?: {
    swr?: SWRConfiguration<Awaited<ReturnType<typeof getRegistryEntry>>, TError> & {
      swrKey?: Key
      enabled?: boolean
    }
    axios?: AxiosRequestConfig
  }
) => {
  const { swr: swrOptions, axios: axiosOptions } = options ?? {}

  const isEnabled = swrOptions?.enabled !== false && !!id
  const swrKey = swrOptions?.swrKey ?? (() => (isEnabled ? getGetRegistryEntryKey(id) : null))
  const swrFn = () => getRegistryEntry(id, axiosOptions)

  const query = useSwr<Awaited<ReturnType<typeof swrFn>>, TError>(swrKey, swrFn, swrOptions)

  return {
    swrKey,
    ...query
  }
}
