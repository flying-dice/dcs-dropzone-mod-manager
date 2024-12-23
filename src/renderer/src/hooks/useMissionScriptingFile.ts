import useSWR from 'swr'
import { client } from '../client'

export const useMissionScriptingFile = () => {
  const current = useSWR('missionScriptingStatus', () => client.validateMissionScripting.query())

  async function getChanges() {
    if (!current.data) throw new Error('No current data')

    const proposed = await client.getNewMissionScriptingFile.query()
    return { existing: current.data.content, proposed }
  }

  async function applyChanges() {
    await client.applyNewMissionScriptingFile.mutate()
    await current.mutate()
  }

  async function refresh() {
    await current.mutate()
  }

  return {
    current: current.data,
    error: current.error,
    getChanges,
    applyChanges,
    refresh
  }
}
