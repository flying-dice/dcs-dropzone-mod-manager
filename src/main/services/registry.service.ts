import { Injectable } from '@nestjs/common'
import {
  type EntryLatestRelease,
  getRegistryEntry,
  getRegistryEntryLatestRelease,
  type RegistryIndexItem
} from '../../lib/client'
import type { SettingsManager } from '../manager/settings.manager'

@Injectable()
export class RegistryService {
  constructor(protected settingsService: SettingsManager) {}

  async getRegistryIndex(modId: string): Promise<RegistryIndexItem> {
    const { data } = await getRegistryEntry(modId, {
      baseURL: await this.settingsService.getRegistryUrl()
    })
    return data
  }

  async getLatestRelease(modId: string): Promise<EntryLatestRelease> {
    const { data } = await getRegistryEntryLatestRelease(modId, {
      baseURL: await this.settingsService.getRegistryUrl()
    })
    return data
  }
}
