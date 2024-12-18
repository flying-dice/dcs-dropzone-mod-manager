import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../schemas/config.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Log } from '../utils/log'

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  @InjectModel(Config.name)
  private configs: Model<Config>

  @Log()
  async getSettingValue(name: string): Promise<{ value: string } | undefined> {
    const config = await this.configs.findOne({ name }).exec()
    return config ? { value: config.value } : undefined
  }

  @Log()
  async getSettingValueOrDefault(name: string, defaultValue: string): Promise<string> {
    const setting = await this.getSettingValue(name)
    return setting ? setting.value : defaultValue
  }

  @Log()
  async setSettingValue(name: string, value: string): Promise<void> {
    this.logger.verbose(`Setting setting ${name} to ${value}`)
    await this.configs
      .updateOne({ name }, { value, lastModified: Date.now() }, { upsert: true })
      .exec()
  }

  @Log()
  async clearSettingValue(name: string) {
    this.logger.verbose(`Clearing setting ${name}`)
    await this.configs.findOneAndDelete({ name }).exec()
  }
}
