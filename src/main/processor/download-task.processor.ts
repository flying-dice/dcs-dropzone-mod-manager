import {
  AssetTaskEntity,
  AssetTaskStatus,
  DownloadTaskPayload
} from '../entities/asset-task.entity'
import { Logger } from '@nestjs/common'
import { TaskProcessor } from './task.processor'
import { config } from '../../lib/config'
import { app } from 'electron'
import { join } from 'path'
import { RcloneClient } from '../../lib/rclone.client'
import { ensureDirSync, moveSync, rmdir } from 'fs-extra'
import { existsSync } from 'node:fs'

export class DownloadTaskProcessor implements TaskProcessor<DownloadTaskPayload> {
  protected readonly logger = new Logger(DownloadTaskProcessor.name)

  private rcloneJobId: number | undefined

  private tempPath: string

  private readonly rcloneClient = new RcloneClient({ baseURL: config.rcloneBaseUrl })

  async process(task: AssetTaskEntity<DownloadTaskPayload>): Promise<void> {
    this.logger.debug(`[${task.id}] - Processing download task`)
    this.logger.verbose(task.payload)

    if (!this.tempPath) {
      await this.createTempFolder(task)
    }

    if (!this.rcloneJobId) {
      await this.create(task)
    } else {
      await this.update(task)
    }
  }

  async postProcess(task: AssetTaskEntity<DownloadTaskPayload>): Promise<void> {
    this.logger.debug(`[${task.id}] - Post processing download task`)
    await this.removeTempFolder()
  }

  private async create(task: AssetTaskEntity<DownloadTaskPayload>) {
    this.logger.debug(`[${task.id}] - Creating rclone job`)
    this.rcloneJobId = await this.createRcloneJob(task, this.tempPath)
    this.logger.debug(`[${task.id}] - Rclone job created with ID ${this.rcloneJobId}`)
    task.status = AssetTaskStatus.IN_PROGRESS
  }

  private async update(task: AssetTaskEntity<DownloadTaskPayload>) {
    if (!this.rcloneJobId) return

    const status = await this.rcloneClient.jobStatus(this.rcloneJobId)
    this.logger.verbose(`[${task.id}] - Download status: %O`, status)

    const stats = await this.rcloneClient.coreStats()
    this.logger.verbose(`[${task.id}] - Download stats: %O`, stats)

    const transfer = stats.transferring?.find((transfer) => transfer.group === status.group)

    if (transfer?.percentage) {
      task.progress = transfer.percentage
    }

    if (status.finished && status.success) {
      this.logger.debug(`[${task.id}] - Download complete`)
      task.status = AssetTaskStatus.COMPLETED
      task.progress = 100
      moveSync(
        join(this.tempPath, task.payload.file),
        join(task.payload.folder, task.payload.file),
        { overwrite: true }
      )
      return
    }

    if (status.finished && !status.success) {
      this.logger.error(`[${task.id}] - Download failed: ${status.error} ${status.error}`)
      task.status = AssetTaskStatus.FAILED
      return
    }
  }

  private async createTempFolder(task: AssetTaskEntity<DownloadTaskPayload>): Promise<void> {
    this.tempPath = join(app.getPath('temp'), config.appDataName, task.id.toString())

    // Clean up the temp path if it exists from a previous run (i.e. if the task was restarted by the app restarting)
    await this.removeTempFolder()

    // Ensure the temp path exists
    ensureDirSync(this.tempPath)

    this.logger.debug(`[${task.id}] - Downloading file to ${this.tempPath}`)
  }

  private async removeTempFolder() {
    if (this.tempPath && existsSync(this.tempPath)) {
      await rmdir(this.tempPath, { recursive: true })
    }
  }

  private async createRcloneJob(
    task: AssetTaskEntity<DownloadTaskPayload>,
    target: string
  ): Promise<number> {
    this.logger.verbose(`[${task.id}] - Creating rclone config for local and http`)
    await this.rcloneClient.configCreate('local', 'local', {})

    this.logger.verbose(`[${task.id}] - Creating rclone config for remote`)
    await this.rcloneClient.configCreate(task.id.toString(), 'http', { url: task.payload.baseUrl })

    this.logger.verbose(`[${task.id}] - Copying file from remote to local`)
    const { jobid } = await this.rcloneClient.operationsCopyfile(
      `${task.id}:`,
      task.payload.file,
      `local:${target}`,
      task.payload.file
    )

    return jobid
  }
}
