import {
  EntryLatestRelease,
  getRegistryEntry,
  getRegistryEntryLatestRelease,
  RegistryIndexItem
} from '../../client'
import { SettingsManager } from '../manager/settings.manager'
import { Injectable } from '@nestjs/common'

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
