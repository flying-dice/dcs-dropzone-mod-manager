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
import { SettingsService } from './services/settings.service'
import { RegistryService } from './services/registry.service'
import { WriteDirectoryService } from './services/write-directory.service'
import { VariablesService } from './services/variables.service'
import { InjectConnection, MongooseModule } from '@nestjs/mongoose'
import { MongooseFactory } from './utils/mongoose.factory'
import { Config, ConfigSchema } from './schemas/config.schema'
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema'
import { Release, ReleaseSchema } from './schemas/release.schema'
import { SubscriptionService } from './services/subscription.service'
import { ReleaseService } from './services/release.service'
import { ReleaseAsset, ReleaseAssetSchema } from './schemas/release-asset.schema'
import { AssetTask, AssetTaskSchema } from './schemas/release-asset-task.schema'
import { Connection } from 'mongoose'
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configuration } from './config'
import { Log } from './utils/log'
import { FsService } from './services/fs.service'
import { UninstallBatManager } from './manager/uninstall-bat.manager'
import { ApplicationClosingEvent } from './events/application-closing.event'
import { ApplicationReadyEvent } from './events/application-ready.event'
import { ScheduleModule } from '@nestjs/schedule'
import { MainWindow } from './windows/main.window'
import { WindowSetting, WindowSettingSchema } from './schemas/window-setting'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: MongooseFactory.factory
    }),
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Release.name, schema: ReleaseSchema },
      { name: ReleaseAsset.name, schema: ReleaseAssetSchema },
      { name: AssetTask.name, schema: AssetTaskSchema },
      { name: WindowSetting.name, schema: WindowSettingSchema }
    ])
  ],
  providers: [
    FsService,
    LifecycleManager,
    MainWindow,
    RegistryService,
    ReleaseService,
    SettingsManager,
    SettingsService,
    SubscriptionManager,
    SubscriptionService,
    TaskManager,
    UninstallBatManager,
    VariablesService,
    WriteDirectoryService
  ]
})
export class AppModule implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name)

  @InjectConnection()
  private readonly connection: Connection

  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2

  @Log()
  async onApplicationBootstrap() {
    this.logger.log('Application is starting...')

    this.eventEmitter.emitAsync(ApplicationReadyEvent.name).then(() => {
      this.logger.log('ApplicationReadyEvent Completed')
    })
  }

  @Log()
  async onApplicationShutdown() {
    this.logger.debug('Shutting down app')

    Logger.log('NApp: Closing Event Firing...')
    await this.eventEmitter.emitAsync(ApplicationClosingEvent.name, new ApplicationClosingEvent())
    Logger.log('NApp: Closing Event Completed, closing app...')

    this.logger.debug('Closing Mongoose connection')
    await MongooseFactory.onApplicationShutdown(this.connection)
  }
}
