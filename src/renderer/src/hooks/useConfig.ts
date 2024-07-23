import useSWR from 'swr'
import { client } from '../client'

export const useConfig = (name: string) => {
  const _value = useSWR(name, (name) => client.getConfigValue.query({ name }))

  return {
    value: _value,
    set: (value: string) =>
      client.setConfigValue.mutate({ name, value }).then(() => _value.mutate()),
    clear: () => client.clearConfigValue.mutate({ name }).then(() => _value.mutate())
  }
}
