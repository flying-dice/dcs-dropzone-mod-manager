import mockFs from 'mock-fs'
import { Test, TestingModule } from '@nestjs/testing'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { UninstallBatManager } from './uninstall-bat.manager'
import { afterEach, beforeAll, beforeEach, expect } from 'vitest'
import { ReleaseService } from '../services/release.service'
import { pathExists, readFile } from 'fs-extra'
import { join } from 'node:path'
import { ModEnabledEvent } from '../events/mod-enabled.event'
import { ModDisabledEvent } from '../events/mod-disabled.event'
import { SettingsManager } from './settings.manager'

const WRITE_DIR = 'C:/Users/username/AppData/Local/dcs-dropzone/mods'

const UNINSTALL_BAT_PATH = join(WRITE_DIR, UninstallBatManager.FILENAME)

const DCS_SAVED_GAMES = 'C:/Users/username/Saved Games/DCS'

function bootstrap() {
  return Test.createTestingModule({
    imports: [EventEmitterModule.forRoot()],
    providers: [
      UninstallBatManager,
      {
        provide: SettingsManager,
        useValue: { getWriteDir: vi.fn().mockResolvedValue(WRITE_DIR) }
      },
      {
        provide: ReleaseService,
        useValue: {
          findAssetsWithSymlinks: vi.fn().mockResolvedValue([
            { links: [{ symlinkPath: `${DCS_SAVED_GAMES}/Scripts/Hooks/hello-world.lua` }] },
            {
              links: [{ symlinkPath: `${DCS_SAVED_GAMES}/Mods/hello-world` }]
            }
          ])
        }
      }
    ]
  }).compile()
}

describe('UninstallBatManager', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await bootstrap()
  })

  beforeEach(async () => {
    mockFs({
      [DCS_SAVED_GAMES]: {
        Mods: { 'hello-world': {} },
        Scripts: { Hooks: { 'hello-world.lua': '-- hello world' } }
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should build file on mod enabled event', async () => {
    await expect(pathExists(UNINSTALL_BAT_PATH)).resolves.toBeFalsy()

    await module.get(UninstallBatManager).onModEnabled(new ModEnabledEvent('mod-id', '1.0.0'))

    await expect(pathExists(UNINSTALL_BAT_PATH)).resolves.toBeTruthy()

    const content = await readFile(UNINSTALL_BAT_PATH, 'utf8')
    expect(content).toMatchSnapshot()
  })

  it('should build file on mod disabled event', async () => {
    await expect(pathExists(UNINSTALL_BAT_PATH)).resolves.toBeFalsy()

    await module.get(UninstallBatManager).onModDisabled(new ModDisabledEvent('mod-id', '1.0.0'))

    await expect(pathExists(UNINSTALL_BAT_PATH)).resolves.toBeTruthy()

    const content = await readFile(UNINSTALL_BAT_PATH, 'utf8')
    expect(content).toMatchSnapshot()
  })
})
