import { Logger } from '@nestjs/common'
import type { MongooseModuleFactoryOptions } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import type { Connection } from 'mongoose'
import { ensureDirSync } from 'fs-extra'
import { Log } from './utils/log'
import { ConfigService } from '@nestjs/config'
import { MainConfig } from './config'

export class MongooseFactory {
  static server: MongoMemoryServer | undefined

  static async factory(
    configService: ConfigService<MainConfig>
  ): Promise<MongooseModuleFactoryOptions> {
    const mongo: MainConfig['mongo'] = await configService.getOrThrow('mongo')
    const dbName = 'dropzone'

    Logger.log('Using MongoMemoryServer', 'MongooseModuleFactory')
    ensureDirSync(mongo.dbPath)
    MongooseFactory.server = await MongoMemoryServer.create({
      instance: {
        dbName,
        ip: '127.0.0.1',
        ...mongo
      }
    })

    const options: MongooseModuleFactoryOptions = {
      uri: MongooseFactory.server.getUri(),
      dbName
    }

    Logger.log(`Dropzone db ${options.uri}`, 'MongooseModuleFactory')
    Logger.log(
      `Dropzone db path ${MongooseFactory.server.instanceInfo?.dbPath}`,
      'MongooseModuleFactory'
    )

    return options
  }

  @Log(new Logger(MongooseFactory.name))
  static async onApplicationShutdown(connection: Connection): Promise<void> {
    Logger.log('Application Shutting Down!', 'MongooseFactory')
    await connection.close(false)

    Logger.log('Shutting down Dropzone', 'MongooseFactory')
    if (MongooseFactory.server) {
      Logger.log('Shutting down MongoMemoryServer', 'MongooseFactory')
      await MongooseFactory.server.stop()
    }
  }
}
