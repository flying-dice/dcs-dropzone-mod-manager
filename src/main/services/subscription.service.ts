import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Subscription } from '../schemas/subscription.schema'
import { Model } from 'mongoose'
import { Log } from '../utils/log'

@Injectable()
export class SubscriptionService {
  @InjectModel(Subscription.name)
  private readonly subscriptions: Model<Subscription>

  @Log()
  async findAll(deleted = false): Promise<Subscription[]> {
    return this.subscriptions
      .find({ deleted })
      .exec()
      .then((it) => it.map((it) => it.toJSON()))
  }

  @Log()
  async findByIdOrThrow(id: string): Promise<Subscription> {
    return this.subscriptions
      .findOne({ id })
      .orFail()
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  @Log()
  async findByModId(modId: string): Promise<Subscription | undefined> {
    return this.subscriptions
      .findOne({ modId })
      .exec()
      .then((it) => it?.toJSON() ?? undefined)
  }

  @Log()
  async findByModIdOrThrow(modId: string): Promise<Subscription> {
    return this.subscriptions
      .findOne({ modId })
      .orFail()
      .exec()
      .then((it) => it.toJSON())
  }

  @Log()
  async deleteByModId(modId: string): Promise<void> {
    await this.subscriptions.deleteOne({ modId }).exec()
  }

  @Log()
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
