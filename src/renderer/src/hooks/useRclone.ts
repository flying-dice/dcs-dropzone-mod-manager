import useSwr from 'swr'
import { config } from '../../../config'
import { RcloneClient, RcloneStats } from '../../../lib/rclone.client'

const rcloneClient = new RcloneClient({ baseURL: config.rcloneBaseUrl })

export const useRclone = () => {
  const stats = useSwr<RcloneStats>('/core/stats', () => rcloneClient.coreStats(), {
    refreshInterval: 500
  })

  return { stats }
}
