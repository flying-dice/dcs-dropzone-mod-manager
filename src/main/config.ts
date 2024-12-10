import { join } from 'node:path'
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { AxiosRequestConfig } from 'axios'
import { app } from 'electron'
import { AssetTaskEntity } from './entities/asset-task.entity'
import { ConfigEntity } from './entities/config.entity'
import { ReleaseAssetEntity } from './entities/release-asset.entity'
import { ReleaseEntity } from './entities/release.entity'
import { SubscriptionEntity } from './entities/subscription.entity'

export type MainConfig = {
  defaultRegistryUrl: string
  appDataName: string
  appData: string
  aptabaseAppKey?: string
  rcloneInstance: AxiosRequestConfig
  typeOrm: TypeOrmModuleOptions
  appOptions: NestApplicationContextOptions
}

const appDataName = 'dcs-dropzone'
const appData = app.getPath('appData')

export const config: MainConfig = {
  defaultRegistryUrl: 'https://dcs-mod-manager-registry.pages.dev/',
  appDataName,
  appData,
  aptabaseAppKey: import.meta.env.MAIN_VITE_APTABASE_APP_KEY,
  rcloneInstance: {
    baseURL: 'http://127.0.0.1:5572'
  },
  typeOrm: {
    type: 'better-sqlite3',
    database: join(appData, appDataName, 'db.sqlite'),
    synchronize: true,
    entities: [AssetTaskEntity, ConfigEntity, SubscriptionEntity, ReleaseEntity, ReleaseAssetEntity]

    // Uncomment these lines to enable logging SQL queries
    // logger: 'advanced-console',
    // logging: 'all'
  },
  appOptions: {
    // Uncomment this line to enable verbose logging
    logger: ['fatal', 'error', 'warn', 'log', 'debug', 'verbose']
    // logger: ['error', 'warn', 'log']
  }
}
