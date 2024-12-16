import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Log } from '../utils/log'
import { Release } from '../schemas/release.schema'
import { AssetTask, AssetTaskStatus } from '../schemas/release-asset-task.schema'
import { ReleaseAsset } from '../schemas/release-asset.schema'

@Injectable()
export class ReleaseService {
  @InjectModel(Release.name)
  private readonly releases: Model<Release>

  @InjectModel(ReleaseAsset.name)
  private readonly releaseAssets: Model<ReleaseAsset>

  @InjectModel(AssetTask.name)
  private readonly assetTasks: Model<AssetTask>

  @Log()
  async findAll(): Promise<Release[]> {
    return this.releases
      .find()
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  @Log()
  async findByModId(modId: string): Promise<Release | undefined> {
    return this.releases
      .findOne({ modId })
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  @Log()
  async findByModIdOrThrow(modId: string): Promise<Release> {
    return this.releases
      .findOne({ modId })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  @Log()
  async findBySubscriptionIdOrThrow(subscriptionId: string): Promise<Release> {
    return this.releases
      .findOne({ subscriptionId })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  @Log()
  async findById(id: string): Promise<Release | undefined> {
    return this.releases
      .findOne({ id })
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  @Log()
  async findByIdOrThrow(id: string): Promise<Release> {
    return this.releases
      .findOne({ id })
      .orFail()
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  @Log()
  async save(release: Release): Promise<Release> {
    await this.releases.updateOne({ id: release.id }, release, { upsert: true }).exec()

    return this.releases
      .findOne({ id: release.id })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  @Log()
  async findAssetsByRelease(releaseId: string): Promise<ReleaseAsset[]> {
    return this.releaseAssets
      .find({ releaseId })
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  @Log()
  async findAssetByIdOrThrow(id: string): Promise<ReleaseAsset> {
    return this.releaseAssets.findOne({ id }).orFail().exec()
  }

  @Log()
  async saveAsset(asset: ReleaseAsset): Promise<ReleaseAsset> {
    await this.releaseAssets.updateOne({ id: asset.id }, { $set: asset }, { upsert: true }).exec()
    return this.releaseAssets
      .findOne({ id: asset.id })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  @Log()
  async saveAssetTask(task: AssetTask): Promise<AssetTask> {
    await this.assetTasks.updateOne({ id: task.id }, { $set: task }, { upsert: true }).exec()
    return this.assetTasks
      .findOne({ id: task.id })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  @Log()
  async findAssetTasksByRelease(releaseId: string): Promise<AssetTask[]> {
    return this.assetTasks
      .find({ releaseId })
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  @Log()
  async findAllAssetTasks(): Promise<AssetTask[]> {
    return this.assetTasks
      .find()
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  @Log()
  async findAssetsWithSymlinks(): Promise<ReleaseAsset[]> {
    return this.releaseAssets
      .find({ symlinkPath: { $ne: null } })
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  async findInProgressAssetTask(): Promise<AssetTask | undefined> {
    return this.assetTasks
      .findOne({ status: AssetTaskStatus.IN_PROGRESS })
      .exec()
      .then((it) => it?.toJSON())
  }

  /**
   * Fetches all subscription IDs associated with releases that contain assets
   * with tasks in a non-terminal state (either "PENDING" or "IN_PROGRESS"),
   * and ensures there are no "FAILED" tasks for those assets.
   *
   * The method performs the following operations:
   * - Groups asset tasks by their `releaseAssetId` and collects their statuses.
   * - Filters to include only assets with at least one task in "PENDING" or "IN_PROGRESS" status.
   * - Excludes any assets that have tasks with a "FAILED" status.
   * - Joins the `releaseassets` collection to retrieve associated subscription IDs.
   * - Returns a unique list of subscription IDs linked to qualifying assets.
   *
   * @returns {Promise<string[]>} A promise resolving to an array of subscription IDs
   *                              meeting the criteria.
   */
  async fetchIdsForActiveSubscriptionTasks(): Promise<string[]> {
    return this.assetTasks
      .aggregate([
        {
          $group: {
            _id: '$releaseAssetId',
            status: {
              $push: '$status'
            }
          }
        },
        {
          $match: {
            status: {
              $elemMatch: {
                $in: ['PENDING', 'IN_PROGRESS']
              }
            }
          }
        },
        {
          $match: {
            status: {
              $not: {
                $elemMatch: {
                  $eq: 'FAILED'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'releaseassets',
            localField: '_id',
            foreignField: 'id',
            as: 'releaseAssetDetails'
          }
        },
        {
          $project: {
            releaseAssetId: '$_id',
            status: 1,
            subscriptionId: {
              $arrayElemAt: ['$releaseAssetDetails.subscriptionId', 0]
            },
            _id: 0
          }
        },
        {
          $group: {
            _id: '$subscriptionId'
          }
        },
        {
          $project: {
            subscriptionId: '$_id',
            _id: 0
          }
        }
      ])
      .exec()
      .then((it) => it.map((it) => it.subscriptionId))
  }

  async deleteBySubscriptionId(id: string) {
    await this.assetTasks.deleteMany({ subscriptionId: id }).exec()
    await this.releaseAssets.deleteMany({ subscriptionId: id }).exec()
    await this.releases.deleteOne({ subscriptionId: id }).exec()
  }

  async findAssetTasksByAssetId(id: string): Promise<AssetTask[]> {
    return this.assetTasks
      .find({ releaseAssetId: id })
      .sort({ sequence: 1 })
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }
}
