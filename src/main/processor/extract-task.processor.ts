import { extname, join } from 'node:path'
import { Logger } from '@nestjs/common'
import { rm } from 'fs-extra'
import { TaskProcessor } from './task.processor'
import {
  AssetTask,
  AssetTaskStatus,
  ExtractTaskPayload
} from '../schemas/release-asset-task.schema'
import { ConfigService } from '@nestjs/config'
import { MainConfig } from '../config'
import { sevenzip } from '../functions/sevenzip'

export class ExtractTaskProcessor implements TaskProcessor<ExtractTaskPayload> {
  protected readonly logger = new Logger(ExtractTaskProcessor.name)

  private terminalStatus: AssetTaskStatus

  private progress: number

  private result?: Promise<void>

  constructor(private readonly configService: ConfigService<MainConfig>) {}

  async process(task: AssetTask<ExtractTaskPayload>): Promise<void> {
    this.logger.debug(`[${task.id}] - Processing extract task`, task.payload)

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

    this.result = sevenzip({
      exePath: join(this.configService.getOrThrow('resourcesDir'), '7za.exe'),
      archivePath: join(task.payload.folder, task.payload.file),
      targetDir: join(
        task.payload.folder,
        task.payload.file.replace(extname(task.payload.file), '')
      ),
      onProgress: (progress) => {
        this.logger.verbose(`[${task.id}] -  ${progress.summary}`)
        this.progress = progress.progress
      }
    })
      .then(() => {
        this.logger.debug(`[${task.id}] - Extract process completed`)
        this.terminalStatus = AssetTaskStatus.COMPLETED
        this.progress = 100
      })
      .catch((error) => {
        this.logger.error(`[${task.id}] - Extract process failed`, error)
        this.terminalStatus = AssetTaskStatus.FAILED
      })
  }

  async postProcess(task: AssetTask<ExtractTaskPayload>) {
    this.logger.debug(`[${task.id}] - Post processing extract task`)
    await rm(join(task.payload.folder, task.payload.file), { force: true })
  }
}
