import { Inject, Injectable, Logger } from '@nestjs/common'
import { SettingsManager } from '../manager/settings.manager'
import {
  EntryIndexHydrated,
  EntryIndexSimple,
  EntryIndexVersionsItem,
  getRegistryEntry,
  getRegistryIndex,
  RegistryIndex
} from '../../lib/client'

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name)

  @Inject()
  protected settingsManager: SettingsManager

  async getRegistryIndex(): Promise<RegistryIndex> {
    const { data } = await getRegistryIndex({
      baseURL: await this.settingsManager.getRegistryUrl()
    })
    return data
  }

  async getRegistryEntryIndex(modId: string): Promise<EntryIndexHydrated> {
    const baseURL = await this.settingsManager.getRegistryUrl()
    const { data } = await getRegistryEntry(modId, {
      baseURL
    })
    const hydratedData = data as EntryIndexHydrated
    if (data.dependencies) {
      hydratedData.dependencies = await Promise.all(
        data.dependencies.map<Promise<EntryIndexSimple>>(async (it) => {
          const { data: depData } = await getRegistryEntry(it, {
            baseURL
          })
          return {
            id: depData.id,
            name: depData.name
          } as EntryIndexSimple
        })
      )
    }
    return hydratedData
  }

  async getLatestVersion(modId: string): Promise<EntryIndexVersionsItem | undefined> {
    this.logger.debug(`Getting latest version for modId ${modId} from Registry`)
    const { latest, versions } = await this.getRegistryEntryIndex(modId)

    return versions.find((it) => it.version === latest)
  }
}
