import useSwr from 'swr'
import { client } from '../client'

export const useModDownloadStatus = (id: string) =>
  useSwr(
    ['getDownloadStatus', id],
    () => client.modServices.getDownloadStatus.query({ modId: id }),
    { refreshInterval: 1000 }
  )
