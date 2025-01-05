import { getUrlPartsForDownload } from './getUrlPartsForDownload'
import { extname } from 'node:path'
import { EntryIndexVersionsItemAssetsItem } from '../../lib/client'
import {
  AssetTask,
  AssetTaskStatus,
  AssetTaskType,
  DownloadTaskPayload,
  ExtractTaskPayload
} from '../schemas/release-asset-task.schema'
import { ReleaseAsset } from '../schemas/release-asset.schema'
import { Release } from '../schemas/release.schema'
import { randomUUID } from 'node:crypto'
import { SUPPORTED_ARCHIVE_EXTENSIONS } from './sevenzip'

export type HydratedReleaseAsset = ReleaseAsset & { tasks: AssetTask[] }

/**
 * Generates a ReleaseAsset object with tasks for downloading and optionally extracting the asset.
 *
 * @param {Release} release - The release to be processed.
 * @param {EntryIndexVersionsItemAssetsItem} asset - The asset to be processed.
 * @param {string} releaseWriteDir - The directory where the asset will be downloaded and extracted.
 *
 * @returns {ReleaseAsset} The release asset with the appropriate tasks.
 */
export function getReleaseAsset(
  release: Release,
  asset: EntryIndexVersionsItemAssetsItem,
  releaseWriteDir: string
): HydratedReleaseAsset {
  const releaseAsset: HydratedReleaseAsset = {
    id: randomUUID(),
    source: asset.source!,
    target: asset.target!,
    releaseId: release.id,
    subscriptionId: release.subscriptionId,
    tasks: [],
    symlinkPath: null
  }

  if (asset.runonstart) {
    releaseAsset.runOnStart = asset.runonstart
  }

  const source = releaseAsset.source

  const { baseUrl, file } = getUrlPartsForDownload(source)
  const downloadTaskPayload: DownloadTaskPayload = { baseUrl, file, folder: releaseWriteDir }

  releaseAsset.tasks.push({
    id: randomUUID(),
    type: AssetTaskType.DOWNLOAD,
    sequence: 1,
    payload: downloadTaskPayload,
    label: `Downloading ${file}`,
    status: AssetTaskStatus.PENDING,
    progress: 0,
    releaseId: release.id,
    subscriptionId: release.subscriptionId,
    releaseAssetId: releaseAsset.id
  })

  if (SUPPORTED_ARCHIVE_EXTENSIONS.map((ext) => `.${ext}`).includes(extname(file))) {
    const extractTaskPayload: ExtractTaskPayload = {
      file,
      folder: releaseWriteDir
    }
    releaseAsset.tasks.push({
      id: randomUUID(),
      sequence: 2,
      type: AssetTaskType.EXTRACT,
      payload: extractTaskPayload,
      label: `Unpacking ${file}`,
      status: AssetTaskStatus.PENDING,
      progress: 0,
      releaseId: release.id,
      subscriptionId: release.subscriptionId,
      releaseAssetId: releaseAsset.id
    })
  }

  return releaseAsset
}
