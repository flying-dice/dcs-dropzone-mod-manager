import { join } from 'node:path'
import { Inject, Injectable } from '@nestjs/common'
import type { SettingsManager } from '../manager/settings.manager'

@Injectable()
export class WriteDirectoryService {
  @Inject()
  private readonly settingsManager: SettingsManager

  async getWriteDirectory(): Promise<string> {
    return this.settingsManager.getWriteDir()
  }

  async getWriteDirectoryForSubscription(id: number): Promise<string> {
    return join(await this.getWriteDirectory(), id.toString())
  }

  async getWriteDirectoryForRelease(subscriptionId: number, releaseId: number): Promise<string> {
    return join(await this.getWriteDirectoryForSubscription(subscriptionId), releaseId.toString())
  }
}
