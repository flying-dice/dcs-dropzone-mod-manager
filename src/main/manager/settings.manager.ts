import { config } from '../../config'
import { Inject, Injectable } from '@nestjs/common'
import { FsService } from '../services/fs.service'
import { ConfigService } from '../services/config.service'

@Injectable()
export class SettingsManager {
  @Inject(FsService)
  private fsGateway: FsService

  @Inject(ConfigService)
  private configGateway: ConfigService

  async getRegistryUrl(): Promise<string> {
    return (
      (await this.configGateway.getConfigValue('registryUrl'))?.value || config.defaultRegistryUrl
    )
  }

  async getWriteDir(): Promise<string> {
    return (
      (await this.configGateway.getConfigValue('writeDir'))?.value ||
      this.fsGateway.getDefaultWriteDir()
    )
  }

  async getGameDir(): Promise<string> {
    const value =
      (await this.configGateway.getConfigValue('gameDir'))?.value ||
      this.fsGateway.getDefaultGameDir()

    if (!value) {
      throw new Error(
        'No game directory configured and default not found, ensure DCS is installed and has been run at least once'
      )
    }

    return value
  }
}
