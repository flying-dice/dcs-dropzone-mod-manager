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
  async findInProgressAssetTask(): Promise<AssetTask | undefined> {
    return this.assetTasks
      .findOne({ status: AssetTaskStatus.IN_PROGRESS })
      .exec()
      .then((it) => it?.toJSON())
  }

  async findPendingAssetTaskSortedBySequence(): Promise<AssetTask | undefined> {
    return this.assetTasks
      .findOne({ status: AssetTaskStatus.PENDING })
      .sort({ sequence: 1, createdAt: 1 })
      .exec()
      .then((it) => it?.toJSON())
  }
}
