import { AssetTask } from '../schemas/release-asset-task.schema'

export function findFirstPendingTask<T extends Pick<AssetTask, 'status' | 'sequence'>>(
  tasks: T[]
): T | undefined {
  let previousTask: T | undefined

  for (const task of tasks) {
    if (task.status === 'PENDING') {
      if (previousTask?.status === 'COMPLETED') {
        return task
      }
      if (!previousTask) {
        return task
      }
    }
    previousTask = task
  }

  return undefined
}
