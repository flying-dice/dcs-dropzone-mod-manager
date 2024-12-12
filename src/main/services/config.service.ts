import { Injectable, Logger } from '@nestjs/common'
import { Config } from '../schemas/config.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name)

  @InjectModel(Config.name)
  private configs: Model<Config>

  async getConfigValue(name: string): Promise<{ value: string } | undefined> {
    this.logger.verbose(`Getting config ${name}`)
    const config = await this.configs.findOne({ name }).exec()
    this.logger.verbose(`Got config`, config?.value)
    return config ? { value: config.value } : undefined
  }

  async getConfigValueOrDefault(name: string, defaultValue: string): Promise<string> {
    const config = await this.getConfigValue(name)
    return config ? config.value : defaultValue
  }

  async setConfigValue(name: string, value: string): Promise<void> {
    this.logger.verbose(`Setting config ${name} to ${value}`)
    await this.configs
      .updateOne({ name }, { value, lastModified: Date.now() }, { upsert: true })
      .exec()
  }

  async clearConfigValue(name: string) {
    this.logger.verbose(`Clearing config ${name}`)
    await this.configs.findOneAndDelete({ name }).exec()
  }
}
