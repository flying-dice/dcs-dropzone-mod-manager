import { Inject, Injectable } from '@nestjs/common'
import {
  type EntryLatestRelease,
  getRegistryEntry,
  getRegistryEntryLatestRelease,
  type RegistryIndexItem
} from '../../lib/client'
import { SettingsManager } from '../manager/settings.manager'

@Injectable()
export class RegistryService {
  @Inject()
  protected settingsManager: SettingsManager

  async getRegistryIndex(modId: string): Promise<RegistryIndexItem> {
    const { data } = await getRegistryEntry(modId, {
      baseURL: await this.settingsManager.getRegistryUrl()
    })
    return data
  }

  async getLatestRelease(modId: string): Promise<EntryLatestRelease> {
    const { data } = await getRegistryEntryLatestRelease(modId, {
      baseURL: await this.settingsManager.getRegistryUrl()
    })
    return data
  }
}
