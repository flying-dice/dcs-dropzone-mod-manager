import { beforeAll, describe, it, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Model } from 'mongoose'
import { SettingsService } from './settings.service'
import { Config, ConfigSchema } from '../schemas/config.schema'
import { getModelToken } from '@nestjs/mongoose'

function bootstrap() {
  return Test.createTestingModule({
    imports: [
      MongooseModule.forRootAsync({
        useFactory: async () => {
          const memory = await MongoMemoryServer.create()

          return {
            uri: memory.getUri()
          }
        }
      }),
      MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }])
    ],
    providers: [SettingsService]
  }).compile()
}

describe('SettingsService', () => {
  let service: SettingsService
  let configModel: Model<Config>

  beforeAll(async () => {
    const module: TestingModule = await bootstrap()

    service = module.get<SettingsService>(SettingsService)
    configModel = module.get<Model<Config>>(getModelToken(Config.name))
  })

  afterEach(async () => {
    // Clear the database after each test
    await configModel.deleteMany({})
  })

  it('should get setting value if it exists', async () => {
    await configModel.create({ name: 'testSetting', value: 'testValue' })

    const result = await service.getSettingValue('testSetting')
    expect(result).toEqual({ value: 'testValue' })
  })

  it('should return undefined if setting does not exist', async () => {
    const result = await service.getSettingValue('nonExistentSetting')
    expect(result).toBeUndefined()
  })

  it('should get setting value or default if setting does not exist', async () => {
    const result = await service.getSettingValueOrDefault('nonExistentSetting', 'defaultValue')
    expect(result).toBe('defaultValue')
  })

  it('should get setting value or default if setting exists', async () => {
    await configModel.create({ name: 'testSetting', value: 'testValue' })

    const result = await service.getSettingValueOrDefault('testSetting', 'defaultValue')
    expect(result).toBe('testValue')
  })

  it('should set a new setting value', async () => {
    await service.setSettingValue('newSetting', 'newValue')

    const config = await configModel.findOne({ name: 'newSetting' }).exec()
    expect(config).toBeDefined()
    expect(config?.value).toBe('newValue')
  })

  it('should update an existing setting value', async () => {
    await configModel.create({ name: 'existingSetting', value: 'oldValue' })

    await service.setSettingValue('existingSetting', 'updatedValue')

    const config = await configModel.findOne({ name: 'existingSetting' }).exec()
    expect(config).toBeDefined()
    expect(config?.value).toBe('updatedValue')
  })

  it('should clear an existing setting value', async () => {
    await configModel.create({ name: 'settingToClear', value: 'valueToClear' })

    await service.clearSettingValue('settingToClear')

    const config = await configModel.findOne({ name: 'settingToClear' }).exec()
    expect(config).toBeNull()
  })

  it('should do nothing when clearing a non-existent setting', async () => {
    await service.clearSettingValue('nonExistentSetting')

    const config = await configModel.findOne({ name: 'nonExistentSetting' }).exec()
    expect(config).toBeNull()
  })
})
