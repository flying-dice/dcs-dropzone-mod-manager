import { describe, expect, it } from 'vitest'
import { WriteDirectoryService } from './write-directory.service'
import { SettingsManager } from '../manager/settings.manager'
import { Subscription } from '../schemas/subscription.schema'
import { Release } from '../schemas/release.schema'
import { Test, TestingModule } from '@nestjs/testing'

describe('WriteDirectoryService', () => {
  let service: WriteDirectoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WriteDirectoryService,
        {
          provide: SettingsManager,
          useValue: {
            getWriteDir: vitest.fn().mockResolvedValue('/write/dir')
          }
        }
      ]
    }).compile()

    service = module.get<WriteDirectoryService>(WriteDirectoryService)
  })

  it('returns the write directory', async () => {
    await expect(service.getWriteDirectory()).resolves.toBe('/write/dir')
  })

  it('returns the write directory for a subscription', async () => {
    const subscription: Subscription = { id: 'sub123' } as Subscription
    await expect(service.getWriteDirectoryForSubscription(subscription)).resolves.toBe(
      '/write/dir/sub123'
    )
  })

  it('returns the write directory for a release', async () => {
    const subscription: Subscription = { id: 'sub123' } as Subscription
    const release: Release = { id: 'rel456' } as Release
    await expect(service.getWriteDirectoryForRelease(subscription, release)).resolves.toBe(
      '/write/dir/sub123/rel456'
    )
  })
})
