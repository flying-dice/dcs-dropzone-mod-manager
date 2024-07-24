import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EntitySchema } from 'typeorm'
import { config } from './config'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionManager } from './manager/subscription.manager'
import { TaskManager } from './manager/task.manager'
import { UpdateManager } from './manager/update.manager'
import { ConfigService } from './services/config.service'
import { FsService } from './services/fs.service'
import { RegistryService } from './services/registry.service'
import { WriteDirectoryService } from './services/write-directory.service'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(config.typeOrm),
    TypeOrmModule.forFeature(config.typeOrm.entities as EntitySchema[])
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
