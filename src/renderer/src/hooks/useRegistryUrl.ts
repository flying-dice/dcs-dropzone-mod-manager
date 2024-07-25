import useSwr from 'swr'
import { client } from '../client'

export const useRegistryUrl = () => useSwr('getRegistryUrl', () => client.getRegistryUrl.query())
