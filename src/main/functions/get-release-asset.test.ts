import { describe, expect, it } from 'vitest'
import { getReleaseAsset, HydratedReleaseAsset } from './get-release-asset'
import { EntryIndexVersionsItemAssetsItem } from '../../lib/types'
import { Release } from '../schemas/release.schema'
import { AssetTaskStatus, AssetTaskType } from '../schemas/release-asset-task.schema'

describe('getReleaseAsset', () => {
  it('should create a download task for a simple asset', () => {
    const release: Release = {
      id: '88822dfd-28d3-4440-bbca-94750e2dda5f',
      subscriptionId: 'fce9873e-dbac-451e-89a4-8a7aabcd7382',
      version: '0.1.0',
      enabled: false,
      pinned: false
    }
    const asset: EntryIndexVersionsItemAssetsItem = {
      remoteSource:
        'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/hello-world.lua',
      links: [
        {
          source: 'hello-world.lua',
          target: '{{DCS_USER_DIR}}/Scripts/Hooks/hello-world.lua',
          runonstart: true
        }
      ]
    }
    const releaseWriteDir = 'C:/Users/JohnDoe/AppData/Local/dcs-dropzone/mods/1/1'

    const result: HydratedReleaseAsset = getReleaseAsset(release, asset, releaseWriteDir)
    const expectedAsset: HydratedReleaseAsset = {
      id: expect.any(String),
      releaseId: expect.any(String),
      subscriptionId: expect.any(String),
      remoteSource:
        'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/hello-world.lua',
      links: [
        {
          source: 'hello-world.lua',
          target: '{{DCS_USER_DIR}}/Scripts/Hooks/hello-world.lua',
          symlinkPath: null,
          runOnStart: true
        }
      ],
      tasks: [
        {
          id: expect.any(String),
          sequence: 1,
          type: AssetTaskType.DOWNLOAD,
          status: AssetTaskStatus.PENDING,
          label: 'Downloading hello-world.lua',
          payload: {
            file: 'hello-world.lua',
            folder: 'C:/Users/JohnDoe/AppData/Local/dcs-dropzone/mods/1/1',
            baseUrl: 'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/'
          },
          progress: 0,
          releaseId: expect.any(String),
          subscriptionId: expect.any(String),
          releaseAssetId: expect.any(String)
        }
      ]
    }
    expect(result).toEqual(expectedAsset)
  })

  it('should create a download and extract task for a zip asset', () => {
    const release: Release = {
      id: '88822dfd-28d3-4440-bbca-94750e2dda5f',
      subscriptionId: 'fce9873e-dbac-451e-89a4-8a7aabcd7382',
      version: '0.1.0',
      enabled: false,
      pinned: false
    }
    const asset: EntryIndexVersionsItemAssetsItem = {
      remoteSource:
        'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/hello-world.zip',
      links: [
        {
          source: 'hello-world',
          target: '{{DCS_USER_DIR}}/Mods/hello-world'
        }
      ]
    }

    const releaseWriteDir = 'C:/Users/JohnDoe/AppData/Local/dcs-dropzone/mods/1/1'

    const result: HydratedReleaseAsset = getReleaseAsset(release, asset, releaseWriteDir)

    const expectedAsset: HydratedReleaseAsset = {
      id: expect.any(String),
      releaseId: expect.any(String),
      subscriptionId: expect.any(String),
      remoteSource:
        'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/hello-world.zip',
      links: [
        {
          runOnStart: false,
          source: 'hello-world',
          target: '{{DCS_USER_DIR}}/Mods/hello-world',
          symlinkPath: null
        }
      ],
      tasks: [
        {
          id: expect.any(String),
          sequence: 1,
          type: AssetTaskType.DOWNLOAD,
          status: AssetTaskStatus.PENDING,
          label: 'Downloading hello-world.zip',
          payload: {
            file: 'hello-world.zip',
            folder: 'C:/Users/JohnDoe/AppData/Local/dcs-dropzone/mods/1/1',
            baseUrl: 'https://github.com/flying-dice/hello-world-mod/releases/download/0.1.0/'
          },
          progress: 0,
          releaseId: expect.any(String),
          subscriptionId: expect.any(String),
          releaseAssetId: expect.any(String)
        },
        {
          id: expect.any(String),
          sequence: 2,
          type: AssetTaskType.EXTRACT,
          status: AssetTaskStatus.PENDING,
          label: 'Unpacking hello-world.zip',
          payload: {
            file: 'hello-world.zip',
            folder: 'C:/Users/JohnDoe/AppData/Local/dcs-dropzone/mods/1/1'
          },
          progress: 0,
          releaseId: expect.any(String),
          subscriptionId: expect.any(String),
          releaseAssetId: expect.any(String)
        }
      ]
    }

    expect(result).toEqual(expectedAsset)
  })
})
