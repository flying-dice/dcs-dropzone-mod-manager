import useSwr from 'swr'
import axios from 'axios'
import { config } from '../../../config'

export type RcloneTransferringStats = {
  bytes: number
  eta: number
  group: string
  name: string
  percentage: number
  size: number
  speed: number
  speedAvg: number
}

export type RcloneStats = {
  bytes: number
  checks: number
  deletedDirs: number
  deletes: number
  elapsedTime: number
  errors: number
  eta: number
  fatalError: boolean
  renames: number
  retryError: boolean
  serverSideCopies: number
  serverSideCopyBytes: number
  serverSideMoveBytes: number
  serverSideMoves: number
  speed: number
  totalBytes: number
  totalChecks: number
  totalTransfers: number
  transferTime: number
  transferring?: [RcloneTransferringStats]
  transfers: number
}

const fetcher = (url: string) =>
  axios.post(url, {}, { baseURL: config.rcloneBaseUrl }).then((res) => res.data)

export const useRclone = () => {
  const stats = useSwr<RcloneStats>('/core/stats', fetcher, { refreshInterval: 500 })

  return { stats }
}
