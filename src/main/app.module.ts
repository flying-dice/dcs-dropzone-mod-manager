import { Logger, Module, OnApplicationShutdown } from '@nestjs/common'
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
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configuration } from './config'
import { Log } from './utils/log'
import { FsService } from './services/fs.service'
import { UninstallBatManager } from './manager/uninstall-bat.manager'
import { MainWindow } from './windows/main.window'
import { WindowSetting, WindowSettingSchema } from './schemas/window-setting'
import { MissionScriptingManager } from './manager/mission-scripting.manager'
import { DcsMissionScriptingService } from './services/dcs-mission-scripting.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
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
    MissionScriptingManager,
    RegistryService,
    ReleaseService,
    SettingsManager,
    SettingsService,
    SubscriptionManager,
    SubscriptionService,
    TaskManager,
    UninstallBatManager,
    VariablesService,
    WriteDirectoryService,
    DcsMissionScriptingService
  ]
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name)

  @InjectConnection()
  private readonly connection: Connection

  @Log()
  async onApplicationShutdown() {
    this.logger.log('========== Closing Database connection ==========')
    await this.connection.close(false)

    this.logger.log('========== Shutting down Database ==========')
    await MongooseFactory.onApplicationShutdown()
  }
}
