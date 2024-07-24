import { join } from 'path'
import { config } from '../lib/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssetTaskEntity } from './entities/asset-task.entity'
import { ConfigEntity } from './entities/config.entity'
import { ConfigService } from './services/config.service'
import { app } from 'electron'
import { FsService } from './services/fs.service'
import { UpdateManager } from './manager/update.manager'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionEntity } from './entities/subscription.entity'
import { RegistryService } from './services/registry.service'
import { SubscriptionManager } from './manager/subscription.manager'
import { ReleaseEntity } from './entities/release.entity'
import { ReleaseAssetEntity } from './entities/release-asset.entity'
import { ScheduleModule } from '@nestjs/schedule'
import { TaskManager } from './manager/task.manager'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { WriteDirectoryService } from './services/write-directory.service'

const database = join(app.getPath('appData'), config.appDataName, 'db.sqlite')

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database,
      entities: [
        AssetTaskEntity,
        ConfigEntity,
        SubscriptionEntity,
        ReleaseEntity,
        ReleaseAssetEntity
      ],
      synchronize: true
      // logger: 'simple-console',
      // logging: 'all'
    }),
    TypeOrmModule.forFeature([
      ConfigEntity,
      SubscriptionEntity,
      ReleaseEntity,
      ReleaseAssetEntity,
      AssetTaskEntity
    ])
  ],
  providers: [
    ConfigService,
    FsService,
    UpdateManager,
    SettingsManager,
    RegistryService,
    SubscriptionManager,
    TaskManager,
    LifecycleManager,
    WriteDirectoryService
  ]
})
export class AppModule {}
