import {
  Inject,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown
} from '@nestjs/common'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionManager } from './manager/subscription.manager'
import { TaskManager } from './manager/task.manager'
import { ConfigService } from './services/config.service'
import { FsService } from './services/fs.service'
import { RegistryService } from './services/registry.service'
import { WriteDirectoryService } from './services/write-directory.service'
import { VariablesService } from './services/variables.service'
import { InjectConnection, MongooseModule } from '@nestjs/mongoose'
import { MongooseFactory } from './mongoose.factory'
import { Config, ConfigSchema } from './schemas/config.schema'
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema'
import { Release, ReleaseSchema } from './schemas/release.schema'
import { SubscriptionService } from './services/subscription.service'
import { ReleaseService } from './services/release.service'
import { ReleaseAsset, ReleaseAssetSchema } from './schemas/release-asset.schema'
import { AssetTask, AssetTaskSchema } from './schemas/release-asset-task.schema'
import { getrclone } from './tools/rclone'
import { get7zip } from './tools/7zip'
import { Connection } from 'mongoose'
import { Log } from './utils/log'
import Aigle from 'aigle'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: MongooseFactory.factory
    }),
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Release.name, schema: ReleaseSchema },
      { name: ReleaseAsset.name, schema: ReleaseAssetSchema },
      { name: AssetTask.name, schema: AssetTaskSchema }
    ])
  ],
  providers: [
    SubscriptionService,
    ReleaseService,
    ConfigService,
    FsService,
    SettingsManager,
    RegistryService,
    SubscriptionManager,
    TaskManager,
    LifecycleManager,
    WriteDirectoryService,
    VariablesService
  ]
})
export class AppModule implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name)

  @InjectConnection()
  private readonly connection: Connection

  @Inject(TaskManager)
  private readonly taskManager: TaskManager

  @Log()
  async onApplicationBootstrap() {
    this.logger.log('Fetching 7zip')
    await get7zip()

    this.logger.log('Fetching rclone')
    const rclone = await getrclone()
    await rclone.startDaemon()

    Aigle.delay(5000).then(async () => {
      this.logger.debug('Starting Task Loop', 'main')
      await this.taskManager.onApplicationReady()
    })
  }

  @Log()
  async onApplicationShutdown() {
    this.logger.debug('Shutting down app', 'main')

    this.logger.debug('Stopping rclone daemon', 'main')
    const rclone = await getrclone()
    await rclone.stopDaemon()

    this.logger.debug('Closing Mongoose connection', 'main')
    await MongooseFactory.onApplicationShutdown(this.connection)
  }
}
