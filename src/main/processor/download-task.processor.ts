import { join } from 'node:path'
import { Logger } from '@nestjs/common'
import { TaskProcessor } from './task.processor'
import {
  AssetTask,
  AssetTaskStatus,
  DownloadTaskPayload,
  ExtractTaskPayload
} from '../schemas/release-asset-task.schema'
import { ConfigService } from '@nestjs/config'
import { MainConfig } from '../config'
import { wget } from '../functions/wget'

export class DownloadTaskProcessor implements TaskProcessor<DownloadTaskPayload> {
  protected readonly logger = new Logger(DownloadTaskProcessor.name)

  private terminalStatus: AssetTaskStatus

  private progress: number

  private result?: Promise<void>

  constructor(private readonly configService: ConfigService<MainConfig>) {}

  async process(task: AssetTask<DownloadTaskPayload>): Promise<void> {
    this.logger.debug(`[${task.id}] - Processing download task ${JSON.stringify(task.payload)}`)

    if (this.result && !this.terminalStatus) {
      task.status = AssetTaskStatus.IN_PROGRESS
      task.progress = this.progress
      return
    }

    if (this.terminalStatus === AssetTaskStatus.COMPLETED) {
      task.status = AssetTaskStatus.COMPLETED
      task.progress = 100
      return
    }

    if (this.terminalStatus === AssetTaskStatus.FAILED) {
      task.status = AssetTaskStatus.FAILED
      return
    }

    this.result = wget({
      exePath: join(this.configService.getOrThrow('resourcesDir'), 'wget.exe'),
      baseUrl: task.payload.baseUrl,
      file: task.payload.file,
      targetDir: task.payload.folder,
      onProgress: (progress) => {
        this.logger.verbose(`[${task.id}] -  ${progress.summary}`)
        this.progress = progress.progress
      }
    })
      .then(() => {
        this.logger.debug(`[${task.id}] - Download process completed`)
        this.terminalStatus = AssetTaskStatus.COMPLETED
        this.progress = 100
      })
      .catch((error) => {
        this.logger.error(`[${task.id}] - Download process failed ${error.message}`)
        this.terminalStatus = AssetTaskStatus.FAILED
      })
  }

  async postProcess(task: AssetTask<ExtractTaskPayload>) {
    this.logger.debug(`[${task.id}] - Post processing download task`)
  }
}
