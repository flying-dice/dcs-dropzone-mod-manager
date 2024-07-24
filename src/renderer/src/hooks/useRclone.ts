import useSwr from 'swr'
import { RcloneClient, type RcloneStats } from '../../../lib/rclone.client'
import { config } from '../config'

const rcloneClient = new RcloneClient({ baseURL: config.rcloneBaseUrl })

export const useRclone = () => {
  const stats = useSwr<RcloneStats>('/core/stats', () => rcloneClient.coreStats(), {
    refreshInterval: 500
  })

  return { stats }
}
