import { Inject, Injectable } from '@nestjs/common'
import { config } from '../config'
import { getDefaultGameDir } from '../functions/getDefaultGameDir'
import { getDefaultWriteDir } from '../functions/getDefaultWriteDir'
import { ConfigService } from '../services/config.service'

/**
 * Settings manager for handling settings related to the application at the implementation level
 * For general access to the settings repository, see the ConfigService
 *
 * This class is mostly used to provide default values for settings that are not set,
 * i.e. the registry URL, installation folders and write directories
 */
@Injectable()
export class SettingsManager {
  @Inject(ConfigService)
  private configGateway: ConfigService

  /**
   * Get the registry URL from the settings repository, or the default value if not set
   */
  async getRegistryUrl(): Promise<string> {
    const url = (await this.configGateway.getConfigValue('registryUrl'))?.value
    return url || config.defaultRegistryUrl
  }

  /**
   * Get the write directory from the settings repository, or the default value if not set
   *
   * Defaults to the dcs-dropzone directory in the user's documents folder @see FsService.getDefaultWriteDir
   */
  async getWriteDir(): Promise<string> {
    return (await this.configGateway.getConfigValue('writeDir'))?.value || getDefaultWriteDir()
  }

  /**
   * Get the installation directory from the settings repository, or the default value if not set
   * Defaults to the DCS installation directory
   *
   * @throws Error if no game directory is set and the default is not found
   */
  async getGameDir(): Promise<string> {
    const value = (await this.configGateway.getConfigValue('gameDir'))?.value || getDefaultGameDir()

    if (!value) {
      throw new Error(
        'No game directory configured and default not found, ensure DCS is installed and has been run at least once'
      )
    }

    return value
  }
}
