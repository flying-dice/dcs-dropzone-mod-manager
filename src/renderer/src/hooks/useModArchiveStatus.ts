import useSwr from 'swr'
import { client } from '../client'

export const useModArchiveStatus = (id: string) =>
  useSwr(['getArchiveStatus', id], () => client.modServices.getArchiveStatus.query({ modId: id }), {
    refreshInterval: 1000
  })
