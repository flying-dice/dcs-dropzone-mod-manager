import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Subscription } from '../schemas/subscription.schema'
import { Model } from 'mongoose'

@Injectable()
export class SubscriptionService {
  @InjectModel(Subscription.name)
  private readonly subscriptions: Model<Subscription>

  async deleteById(id: string): Promise<void> {
    await this.subscriptions.deleteOne({ id }).exec()
  }

  async findById(id: string): Promise<Subscription | undefined> {
    return this.subscriptions
      .findOne({ id })
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptions
      .find()
      .sort({ created: 1 }) // Sort by created date ascending
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  async findAllByIds(ids: string[]): Promise<Subscription[]> {
    return this.subscriptions
      .find({ id: { $in: ids } })
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  async findByIdOrThrow(id: string): Promise<Subscription> {
    return this.subscriptions
      .findOne({ id })
      .orFail()
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  async findByModId(modId: string): Promise<Subscription | undefined> {
    return this.subscriptions
      .findOne({ modId })
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  async findByModIdOrThrow(modId: string): Promise<Subscription> {
    return this.subscriptions
      .findOne({ modId })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  async save(subscription: Subscription): Promise<Subscription> {
    await this.subscriptions
      .updateOne({ modId: subscription.modId }, subscription, { upsert: true })
      .exec()

    return this.subscriptions
      .findOne({ modId: subscription.modId })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }
}
