import useSwr from 'swr'
import { client } from '../client'

export const useSubscriptions = () =>
  useSwr('getAllSubscriptions', () => client.getAllSubscriptions.query(), { refreshInterval: 1000 })
