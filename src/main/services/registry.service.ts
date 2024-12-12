import { Inject, Injectable } from '@nestjs/common'
import { SettingsManager } from '../manager/settings.manager'
import { EntryIndex, EntryIndexVersionsItem, getRegistryEntry } from '../../lib/client'

@Injectable()
export class RegistryService {
  @Inject()
  protected settingsManager: SettingsManager

  async getRegistryIndex(modId: string): Promise<EntryIndex> {
    const { data } = await getRegistryEntry(modId, {
      baseURL: await this.settingsManager.getRegistryUrl()
    })
    return data
  }

  async getLatestRelease(modId: string): Promise<EntryIndexVersionsItem | undefined> {
    const { latest, versions } = await this.getRegistryIndex(modId)
    return versions.find((it) => it.version === latest)
  }
}
