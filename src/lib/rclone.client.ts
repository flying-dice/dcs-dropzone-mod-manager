import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { z } from 'zod'

export const rcloneTransferringStatsSchema = z.object({
  bytes: z.number().optional(),
  eta: z.number().nullable().optional(),
  group: z.string().optional(),
  name: z.string().optional(),
  percentage: z.number().optional(),
  size: z.number().optional(),
  speed: z.number().optional(),
  speedAvg: z.number().optional()
})
export type RcloneTransferringStats = z.infer<typeof rcloneTransferringStatsSchema>

export const rcloneStatsSchema = z.object({
  bytes: z.number(),
  checks: z.number(),
  deletedDirs: z.number(),
  deletes: z.number(),
  elapsedTime: z.number(),
  errors: z.number(),
  eta: z.number().nullable().optional(),
  fatalError: z.boolean(),
  renames: z.number(),
  retryError: z.boolean(),
  serverSideCopies: z.number(),
  serverSideCopyBytes: z.number(),
  serverSideMoveBytes: z.number(),
  serverSideMoves: z.number(),
  speed: z.number(),
  totalBytes: z.number(),
  totalChecks: z.number(),
  totalTransfers: z.number(),
  transferTime: z.number(),
  transferring: z.array(rcloneTransferringStatsSchema).optional(),
  transfers: z.number()
})
export type RcloneStats = z.infer<typeof rcloneStatsSchema>

export const rcloneJobStatusSchema = z.object({
  duration: z.number(),
  endTime: z.string(),
  error: z.string(),
  finished: z.boolean(),
  group: z.string(),
  id: z.number(),
  output: z.unknown({}),
  startTime: z.string(),
  success: z.boolean()
})
export type RcloneJobStatus = z.infer<typeof rcloneJobStatusSchema>

export const rcloneOperationsCopyfileResponseSchema = z.object({
  jobid: z.number()
})
export type RcloneOperationsCopyfileResponse = z.infer<
  typeof rcloneOperationsCopyfileResponseSchema
>

export class RcloneClient {
  private readonly instance: AxiosInstance

  constructor(requestConfig: AxiosRequestConfig) {
    this.instance = axios.create(requestConfig)
  }

  async configCreate(name: string, type: string, parameters: any): Promise<void> {
    await this.instance.post('/config/create', { parameters, name, type })
  }

  async jobStatus(jobid: number): Promise<RcloneJobStatus> {
    const status = await this.instance.post<RcloneJobStatus>('/job/status', {
      jobid
    })

    return rcloneJobStatusSchema.parse(status.data)
  }

  async coreStats(): Promise<RcloneStats> {
    const stats = await this.instance.post<RcloneStats>('/core/stats', {})

    return rcloneStatsSchema.parse(stats.data)
  }

  async operationsCopyfile(
    srcFs: string,
    srcRemote: string,
    dstFs: string,
    dstRemote: string
  ): Promise<RcloneOperationsCopyfileResponse> {
    const { data } = await this.instance.post<RcloneOperationsCopyfileResponse>(
      '/operations/copyfile',
      {
        _async: true,
        srcFs,
        srcRemote,
        dstFs,
        dstRemote
      }
    )

    return rcloneOperationsCopyfileResponseSchema.parse(data)
  }
}
