import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigEntity } from '../entities/config.entity'
import { Repository } from 'typeorm'

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name)

  constructor(
    @InjectRepository(ConfigEntity) private readonly configRepo: Repository<ConfigEntity>
  ) {}

  async getConfigValue(name: string): Promise<{ value: string; lastModified: number } | undefined> {
    const config = await this.configRepo.findOneBy({ name })
    return config ? { value: config.value, lastModified: config.lastModified } : undefined
  }

  async setConfigValue(name: string, value: string): Promise<void> {
    this.logger.debug(`Setting config ${name} to ${value}`)
    await this.configRepo.upsert(
      { name, value, lastModified: Date.now() },
      { upsertType: 'on-conflict-do-update', conflictPaths: ['name'] }
    )
  }

  async clearConfigValue(name: string) {
    this.logger.debug(`Clearing config ${name}`)
    const row = await this.configRepo.findOneBy({ name })
    if (row) {
      this.logger.debug(`Found config with id ${row.id} Removing config ${name}`)
      await this.configRepo.remove(row)
    }
  }
}
