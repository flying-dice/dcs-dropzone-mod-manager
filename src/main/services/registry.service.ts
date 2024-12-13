import { Inject, Injectable } from '@nestjs/common'
import { SettingsManager } from '../manager/settings.manager'
import {
  EntryIndex,
  EntryIndexVersionsItem,
  getRegistryEntry,
  getRegistryIndex,
  RegistryIndex
} from '../../lib/client'

@Injectable()
export class RegistryService {
  @Inject()
  protected settingsManager: SettingsManager

  async getRegistryIndex(): Promise<RegistryIndex> {
    const { data } = await getRegistryIndex({
      baseURL: await this.settingsManager.getRegistryUrl()
    })
    return data
  }

  async getRegistryEntryIndex(modId: string): Promise<EntryIndex> {
    const { data } = await getRegistryEntry(modId, {
      baseURL: await this.settingsManager.getRegistryUrl()
    })
    return data
  }

  async getLatestVersion(modId: string): Promise<EntryIndexVersionsItem | undefined> {
    const { latest, versions } = await this.getRegistryEntryIndex(modId)
    return versions.find((it) => it.version === latest)
  }
}
