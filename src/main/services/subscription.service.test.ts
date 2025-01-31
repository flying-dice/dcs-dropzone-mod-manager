import { Test, TestingModule } from '@nestjs/testing'
import { beforeAll, afterEach, describe, expect, it, beforeEach } from 'vitest'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Subscription, SubscriptionSchema } from '../schemas/subscription.schema'
import { SubscriptionService } from './subscription.service'
import { cloneDeep } from 'lodash'

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
      MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }])
    ],
    providers: [SubscriptionService]
  }).compile()
}

describe('SubscriptionService', () => {
  let moduleRef: TestingModule
  let subscriptionService: SubscriptionService

  const testSubscription: Subscription = {
    id: 'test-subscription',
    modId: 'test-mod',
    modName: 'Test Subscription',
    created: Date.now(),
    dependencies: []
  }

  beforeAll(async () => {
    moduleRef = await bootstrap()
    subscriptionService = moduleRef.get(SubscriptionService)
  })

  beforeEach(async () => {
    await subscriptionService.save(cloneDeep(testSubscription))
  })

  afterEach(async () => {
    // Cleanup database between tests
    await subscriptionService.deleteById(testSubscription.id)
  })

  it('should find a subscription by id', async () => {
    const subscription = await subscriptionService.findByIdOrThrow(testSubscription.id)
    expect(subscription).toMatchObject(testSubscription)
  })

  it('should return undefined if subscription is not found by id', async () => {
    const subscription = await subscriptionService.findById('non-existent-id')
    expect(subscription).toBeUndefined()
  })

  it('should find a subscription by mod id', async () => {
    const subscription = await subscriptionService.findByModIdOrThrow(testSubscription.modId)
    expect(subscription).toMatchObject(testSubscription)
  })

  it('should retrieve all subscriptions', async () => {
    await subscriptionService.save({
      ...testSubscription,
      id: 'test-subscription-2',
      modId: 'test-mod-2'
    })
    const subscriptions = await subscriptionService.findAll()
    expect(subscriptions).toHaveLength(2)
  })

  it('should retrieve subscriptions by multiple ids', async () => {
    const additionalSubscription = {
      ...testSubscription,
      id: 'test-subscription-2',
      modId: 'test-mod-2'
    }
    await subscriptionService.save(cloneDeep(additionalSubscription))

    const subscriptions = await subscriptionService.findAllByIds([
      testSubscription.id,
      additionalSubscription.id
    ])
    expect(subscriptions).toHaveLength(2)
    expect(subscriptions[0]).toMatchObject(testSubscription)
    expect(subscriptions[1]).toMatchObject(additionalSubscription)
  })

  it('should delete a subscription by id', async () => {
    await subscriptionService.deleteById(testSubscription.id)

    const subscription = await subscriptionService.findById(testSubscription.id)
    expect(subscription).toBeUndefined()
  })

  it('should upsert a subscription', async () => {
    const updatedSubscription: Subscription = {
      ...testSubscription,
      modName: 'Updated Subscription Name'
    }
    await subscriptionService.save(updatedSubscription)

    const subscription = await subscriptionService.findByIdOrThrow(testSubscription.id)
    expect(subscription.modName).toBe('Updated Subscription Name')
  })
})
