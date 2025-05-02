import { Test, TestingModule } from '@nestjs/testing'
import { RegistryService } from './registry.service'
import nock from 'nock'
import { beforeAll, expect } from 'vitest'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { SettingsManager } from '../manager/settings.manager'
import { SettingsService } from './settings.service'
import { Config, ConfigSchema } from '../schemas/config.schema'
import registryIndex from '../__stubs__/index.json'
import modIndex from '../__stubs__/example-mod/index.json'
import { DEFAULT_REGISTRY_URL } from '../../lib/registry'

vi.mock('@aptabase/electron/main')
vi.mock('electron')

function bootstrap() {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [() => ({ registryUrl: DEFAULT_REGISTRY_URL })]
      }),
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
    providers: [RegistryService, SettingsManager, SettingsService]
  }).compile()
}

describe('RegistryService', () => {
  describe('GIVEN default values', () => {
    let moduleRef: TestingModule

    beforeAll(async () => {
      moduleRef = await bootstrap()
    })

    it('should successfully subscribe to a mod', async () => {
      nock(DEFAULT_REGISTRY_URL).get('/index.json').reply(200, registryIndex)

      await expect(moduleRef.get(RegistryService).getRegistryIndex()).resolves.toMatchSnapshot()
    })

    it('should successfully fetch the mod index', async () => {
      nock(DEFAULT_REGISTRY_URL).get('/example-mod/index.json').reply(200, modIndex)

      await expect(
        moduleRef.get(RegistryService).getRegistryEntryIndex('example-mod')
      ).resolves.toMatchSnapshot()
    })
  })

  describe('GIVEN overridden values', () => {
    let moduleRef: TestingModule

    beforeAll(async () => {
      moduleRef = await bootstrap()

      await moduleRef.get(SettingsService).setSettingValue('registryUrl', 'https://example.com')
    })

    it('should successfully subscribe to a mod', async () => {
      nock('https://example.com').get('/index.json').reply(200, registryIndex)

      await expect(moduleRef.get(RegistryService).getRegistryIndex()).resolves.toMatchSnapshot()
    })

    it('should successfully fetch the mod index', async () => {
      nock('https://example.com').get('/example-mod/index.json').reply(200, modIndex)

      await expect(
        moduleRef.get(RegistryService).getRegistryEntryIndex('example-mod')
      ).resolves.toMatchSnapshot()
    })
  })
})
