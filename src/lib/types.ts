import {
  GetRegistryEntry200,
  GetRegistryEntry200VersionsItem,
  GetRegistryEntry200VersionsItemAssetsItem,
  GetRegistryIndex200Item
} from './client'

export type ProgressLabel = 'Pending' | 'In Progress' | 'Completed' | 'Failed'

export type EntryIndexVersionsItem = GetRegistryEntry200VersionsItem

export type RegistryIndexItem = GetRegistryIndex200Item

export type RegistryIndex = GetRegistryIndex200Item[]

export interface EntryIndexSimple {
  id: string
  name: string
}

export interface EntryIndexHydrated extends Omit<GetRegistryEntry200, 'dependencies'> {
  dependencies?: EntryIndexSimple[]
}

export type RegistryIndexItemAuthorsItem = {
  avatar?: string
  name: string
  url?: string
}

export type EntryIndexVersionsItemAssetsItem = GetRegistryEntry200VersionsItemAssetsItem
