import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../schemas/config.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Log } from '../utils/log'

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name)

  @InjectModel(Config.name)
  private configs: Model<Config>

  @Log()
  async getConfigValue(name: string): Promise<{ value: string } | undefined> {
    const config = await this.configs.findOne({ name }).exec()
    return config ? { value: config.value } : undefined
  }

  @Log()
  async getConfigValueOrDefault(name: string, defaultValue: string): Promise<string> {
    const config = await this.getConfigValue(name)
    return config ? config.value : defaultValue
  }

  @Log()
  async setConfigValue(name: string, value: string): Promise<void> {
    this.logger.verbose(`Setting config ${name} to ${value}`)
    await this.configs
      .updateOne({ name }, { value, lastModified: Date.now() }, { upsert: true })
      .exec()
  }

  @Log()
  async clearConfigValue(name: string) {
    this.logger.verbose(`Clearing config ${name}`)
    await this.configs.findOneAndDelete({ name }).exec()
  }
}
