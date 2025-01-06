import { Test, TestingModule } from '@nestjs/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {
  AssetTask,
  AssetTaskSchema,
  AssetTaskStatus,
  AssetTaskType
} from '../schemas/release-asset-task.schema'
import { ReleaseAsset, ReleaseAssetSchema } from '../schemas/release-asset.schema'
import { Release, ReleaseSchema } from '../schemas/release.schema'
import { ReleaseService } from './release.service'
import { cloneDeep, omit } from 'lodash'
import { randomUUID } from 'node:crypto'
import { EntryIndexVersionsItem } from '../../lib/client'
import { getReleaseAsset, HydratedReleaseAsset } from '../functions/get-release-asset'

vi.mock('@aptabase/electron/main')
vi.mock('electron')

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
      MongooseModule.forFeature([
        { name: Release.name, schema: ReleaseSchema },
        { name: ReleaseAsset.name, schema: ReleaseAssetSchema },
        { name: AssetTask.name, schema: AssetTaskSchema }
      ])
    ],
    providers: [ReleaseService]
  }).compile()
}

function createReleaseWithAssetsAndTask(versionsItem: EntryIndexVersionsItem) {
  const subscriptionId = randomUUID()

  const release: Release = {
    id: randomUUID(),
    subscriptionId,
    version: versionsItem.version!,
    enabled: false
  }

  const assets: HydratedReleaseAsset[] = []

  for (const asset of versionsItem.assets) {
    assets.push(getReleaseAsset(release, asset, 'C:/some/path'))
  }

  return { release, assets }
}

describe('ReleaseService', () => {
  let moduleRef: TestingModule
  let releaseService: ReleaseService

  const testRelease: Release = {
    id: 'test-release',
    subscriptionId: 'test-subscription',
    version: '1.0.0',
    enabled: false
  }

  const testAsset: ReleaseAsset = {
    id: 'test-asset',
    releaseId: 'test-release',
    subscriptionId: testRelease.subscriptionId,
    remoteSource: 'http://example.com/file.lua',
    source: 'file.lua',
    target: '{{SOME_VAR}}/Scripts/file.lua',
    symlinkPath: null
  }

  const testAssetTask: AssetTask = {
    id: 'download-task',
    status: AssetTaskStatus.PENDING,
    type: AssetTaskType.DOWNLOAD,
    releaseAssetId: testAsset.id,
    releaseId: testRelease.id,
    subscriptionId: testRelease.subscriptionId,
    label: 'Downloading file.lua',
    progress: 0,
    payload: {
      baseUrl: 'http://example.com',
      file: 'file.lua',
      folder: 'local-folder-to-save'
    },
    sequence: 1
  }

  beforeAll(async () => {
    moduleRef = await bootstrap()
    releaseService = moduleRef.get(ReleaseService)
  })

  beforeEach(async () => {
    await releaseService.save(cloneDeep(testRelease))
    await releaseService.saveAsset(cloneDeep(testAsset))
    await releaseService.saveAssetTask(cloneDeep(testAssetTask))
  })

  afterEach(async () => {
    await releaseService.deleteBySubscriptionId(testRelease.subscriptionId)
  })

  it('should find a release by id', async () => {
    const release = await releaseService.findByIdOrThrow(testRelease.id)
    expect(release).toMatchObject(testRelease)
  })

  it('should find a release by subscription id', async () => {
    const release = await releaseService.findBySubscriptionIdOrThrow(testRelease.subscriptionId)
    expect(release).toMatchObject(testRelease)
  })

  it("should throw an error if a release doesn't exist", async () => {
    await expect(releaseService.findByIdOrThrow('non-existent-id')).rejects.toThrow()
  })

  it('should save a release asset and retrieve it', async () => {
    const asset = await releaseService.findAssetByIdOrThrow(testAsset.id)
    expect(asset).toMatchObject(testAsset)
  })

  it('should retrieve all assets for a release', async () => {
    const assets = await releaseService.findAssetsByRelease(testRelease.id)
    expect(assets).toHaveLength(1)
    expect(assets[0]).toMatchObject(testAsset)
  })

  it('should retrieve all asset tasks for a release', async () => {
    const tasks = await releaseService.findAssetTasksByRelease(testRelease.id)
    expect(tasks).toHaveLength(1)
    expect(tasks[0]).toMatchObject(testAssetTask)
  })

  it('should retrieve in-progress asset tasks', async () => {
    await releaseService.saveAssetTask({
      ...testAssetTask,
      id: 'in-progress-task',
      status: AssetTaskStatus.IN_PROGRESS
    })

    const task = await releaseService.findInProgressAssetTask()
    expect(task).toBeDefined()
    expect(task?.status).toBe(AssetTaskStatus.IN_PROGRESS)
  })

  it('should fetch active subscription IDs', async () => {
    const subscriptionIds = await releaseService.fetchIdsForActiveSubscriptionTasks()
    expect(subscriptionIds).toContain(testRelease.subscriptionId)
  })

  it('should delete a release and its associated data by subscription ID', async () => {
    await releaseService.deleteBySubscriptionId(testRelease.subscriptionId)

    await expect(releaseService.findById(testRelease.id)).resolves.toBeUndefined()
    await expect(releaseService.findAssetsByRelease(testRelease.id)).resolves.toHaveLength(0)
    await expect(releaseService.findAssetTasksByRelease(testRelease.id)).resolves.toHaveLength(0)
  })

  it('should include subscriptions with all tasks pending when calling fetchIdsForActiveSubscriptionTasks', async () => {
    const { release, assets } = createReleaseWithAssetsAndTask({
      version: '1.0.0',
      date: new Date().toISOString(),
      releasepage: 'http://example.com',
      assets: [
        {
          remoteSource: 'http://example.com/file.lua',
          links: [
            {
              source: 'file.lua',
              target: '{{SOME_VAR}}/Scripts/file.lua'
            }
          ]
        }
      ]
    })

    expect(assets[0].tasks[0].status).toBe(AssetTaskStatus.PENDING)

    await releaseService.save(release)
    for (const asset of assets) {
      await releaseService.saveAsset(asset)
      for (const task of asset.tasks) {
        await releaseService.saveAssetTask(task)
      }
    }

    return expect(releaseService.fetchIdsForActiveSubscriptionTasks()).resolves.toContainEqual(
      release.subscriptionId
    )
  })

  it('should include subscriptions with some tasks pending and some completed when calling fetchIdsForActiveSubscriptionTasks', async () => {
    const { release, assets } = createReleaseWithAssetsAndTask({
      version: '1.0.0',
      date: new Date().toISOString(),
      releasepage: 'http://example.com',
      assets: [
        {
          remoteSource: 'http://example.com/file.zip',
          links: [
            {
              source: 'file.lua',
              target: '{{SOME_VAR}}/Scripts/file.lua'
            }
          ]
        }
      ]
    })

    assets[0].tasks[0].status = AssetTaskStatus.COMPLETED

    expect(assets[0].tasks[0].status).toBe(AssetTaskStatus.COMPLETED)
    expect(assets[0].tasks[1].status).toBe(AssetTaskStatus.PENDING)

    await releaseService.save(release)
    for (const asset of assets) {
      await releaseService.saveAsset(asset)
      for (const task of asset.tasks) {
        await releaseService.saveAssetTask(task)
      }
    }

    return expect(releaseService.fetchIdsForActiveSubscriptionTasks()).resolves.toContainEqual(
      release.subscriptionId
    )
  })

  it('should exclude subscriptions with some tasks pending and some failed when calling fetchIdsForActiveSubscriptionTasks', async () => {
    const { release, assets } = createReleaseWithAssetsAndTask({
      version: '1.0.0',
      date: new Date().toISOString(),
      releasepage: 'http://example.com',
      assets: [
        {
          remoteSource: 'http://example.com/file.zip',
          links: [
            {
              source: 'script.lua',
              target: '{{SOME_VAR}}/Scripts/file.lua'
            }
          ]
        }
      ]
    })

    assets[0].tasks[0].status = AssetTaskStatus.FAILED

    expect(assets[0].tasks[0].status).toBe(AssetTaskStatus.FAILED)
    expect(assets[0].tasks[1].status).toBe(AssetTaskStatus.PENDING)

    await releaseService.save(release)
    for (const asset of assets) {
      await releaseService.saveAsset(asset)
      for (const task of asset.tasks) {
        await releaseService.saveAssetTask(task)
      }
    }

    return expect(releaseService.fetchIdsForActiveSubscriptionTasks()).resolves.not.toContainEqual(
      release.subscriptionId
    )
  })

  it('should return only assets with symbolic links defined when calling findAssetsWithSymlinks', async () => {
    const enabledMod = createReleaseWithAssetsAndTask({
      version: '1.0.0',
      date: new Date().toISOString(),
      releasepage: 'http://example.com',
      assets: [
        {
          remoteSource: 'http://example.com/file.lua',
          links: [
            {
              source: 'file.lua',
              target: '{{SOME_VAR}}/Scripts/file.lua'
            }
          ]
        }
      ]
    })

    enabledMod.assets[0].symlinkPath = 'C:/some/path/file.lua'
    enabledMod.release.enabled = true

    await releaseService.save(enabledMod.release)
    for (const asset of enabledMod.assets) {
      await releaseService.saveAsset(asset)
      for (const task of asset.tasks) {
        await releaseService.saveAssetTask(task)
      }
    }

    const disabledMod = createReleaseWithAssetsAndTask({
      version: '1.0.0',
      date: new Date().toISOString(),
      releasepage: 'http://example.com',
      assets: [
        {
          remoteSource: 'http://example.com/file.lua',
          links: [
            {
              source: 'file.lua',
              target: '{{SOME_VAR}}/Scripts/file.lua'
            }
          ]
        }
      ]
    })

    disabledMod.assets[0].symlinkPath = null
    disabledMod.release.enabled = false

    await releaseService.save(disabledMod.release)
    for (const asset of disabledMod.assets) {
      await releaseService.saveAsset(asset)
      for (const task of asset.tasks) {
        await releaseService.saveAssetTask(task)
      }
    }

    const result = await releaseService.findAssetsWithSymlinks()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject(omit(enabledMod.assets[0], 'tasks'))
  })
})
