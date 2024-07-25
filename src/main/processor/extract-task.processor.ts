import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { extname, join } from 'node:path'
import { Logger } from '@nestjs/common'
import { rm } from 'fs-extra'
import {
  type AssetTaskEntity,
  AssetTaskStatus,
  type ExtractTaskPayload
} from '../entities/asset-task.entity'
import { get7zip } from '../tools/7zip'
import { TaskProcessor } from './task.processor'

export class ExtractTaskProcessor implements TaskProcessor<ExtractTaskPayload> {
  protected readonly logger = new Logger(ExtractTaskProcessor.name)

  private extractProcess: ChildProcessWithoutNullStreams

  private terminalStatus: AssetTaskStatus

  private progress: number

  private lastStdout: string

  async process(task: AssetTaskEntity<ExtractTaskPayload>): Promise<void> {
    this.logger.debug(`[${task.id}] - Processing extract task`, task.payload)

    if (!this.extractProcess) {
      await this.start(task)
      task.status = AssetTaskStatus.IN_PROGRESS
    } else {
      await this.updateProgress()
      task.progress = this.progress
    }

    if (this.terminalStatus) {
      task.status = this.terminalStatus
    }
  }

  async postProcess(task: AssetTaskEntity<ExtractTaskPayload>) {
    this.logger.debug(`[${task.id}] - Post processing extract task`)
    await rm(join(task.payload.folder, task.payload.file), { force: true })
    if (this.extractProcess) {
      this.extractProcess.kill()
      this.extractProcess.removeAllListeners()
    }
  }

  async start(task: AssetTaskEntity<ExtractTaskPayload>) {
    const _7zip = await get7zip()

    this.extractProcess = _7zip.spawnExtractor(
      join(task.payload.folder, task.payload.file),
      join(task.payload.folder, task.payload.file.replace(extname(task.payload.file), ''))
    )

    this.extractProcess.stdout.on('data', (data) => {
      this.logger.debug(`[${task.id}] - Extract stdout: ${data.toString()}`)
      this.lastStdout = data.toString()
    })

    this.extractProcess.on('close', (code) => {
      if (code === 0) {
        this.logger.debug(`[${task.id}] - Extract process completed`)
        this.terminalStatus = AssetTaskStatus.COMPLETED
        this.progress = 100
      } else {
        this.logger.error(`[${task.id}] - Extract process failed with code ${code}`)
        this.terminalStatus = AssetTaskStatus.FAILED
      }
    })
  }

  async updateProgress() {
    if (!this.extractProcess) return
    try {
      this.progress = Number(this.lastStdout.match(/(\d+)%/)?.[1] || this.progress)
    } catch (error) {
      this.logger.error('Error updating progress', error)
    }
  }
}
