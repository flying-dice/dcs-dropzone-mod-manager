import { Inject, Injectable } from '@nestjs/common'
import { SettingsService } from '../services/settings.service'
import { DEFAULT_REGISTRY_URL } from '../constants'
import { ConfigService } from '@nestjs/config'
import { join } from 'node:path'
import { MainConfig } from '../config'

/**
 * Settings manager for handling settings related to the application at the implementation level
 * For general access to the settings repository, see the ConfigService
 *
 * This class is mostly used to provide default values for settings that are not set,
 * i.e. the registry URL, installation folders and write directories
 */
@Injectable()
export class SettingsManager {
  @Inject(SettingsService)
  private settingsService: SettingsService

  @Inject(ConfigService)
  private configService: ConfigService<MainConfig>

  /**
   * Get the registry URL from the settings repository, or the default value if not set
   */
  async getRegistryUrl(): Promise<string> {
    const url = (await this.settingsService.getSettingValue('registryUrl'))?.value
    return url || this.getDefaultRegistryUrl()
  }

  async getDefaultRegistryUrl(): Promise<string> {
    return DEFAULT_REGISTRY_URL
  }

  /**
   * Get the write directory from the settings repository, or the default value if not set
   *
   * Defaults to the dcs-dropzone directory in the user's documents folder @see FsService.getDefaultWriteDir
   */
  async getWriteDir(): Promise<string> {
    const configuredDir = (await this.settingsService.getSettingValue('writeDir'))?.value
    return configuredDir || this.getDefaultWriteDir()
  }

  async getDefaultWriteDir(): Promise<string> {
    return join(this.configService.getOrThrow('writeDir'), 'mods')
  }

  /**
   * Get the installation directory from the settings repository, or the default value if not set
   * Defaults to the DCS installation directory
   *
   * @throws Error if no game directory is set and the default is not found
   */
  async getGameDir(): Promise<string> {
    const configuredDir = (await this.settingsService.getSettingValue('gameDir'))?.value
    const value = configuredDir || (await this.getDefaultGameDir())

    if (!value) {
      throw new Error(
        'No game directory configured and default not found, ensure DCS is installed and has been run at least once'
      )
    }

    return value
  }

  async getDefaultGameDir(): Promise<string | undefined> {
    return this.configService.get('defaultDcsWriteDir')
  }
}
