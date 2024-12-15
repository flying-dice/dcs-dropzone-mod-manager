import { describe, expect, it } from 'vitest'
import { findFirstPendingTask } from './find-first-pending-task'
import { AssetTaskStatus, AssetTaskType } from '../schemas/release-asset-task.schema'

describe('findFirstPending', () => {
  it('should return the first pending task with sequence 1', () => {
    const tasks = [
      { id: '1', sequence: 1, status: AssetTaskStatus.PENDING, type: AssetTaskType.DOWNLOAD },
      { id: '2', sequence: 2, status: AssetTaskStatus.PENDING, type: AssetTaskType.EXTRACT }
    ]
    const result = findFirstPendingTask(tasks)
    expect(result).toEqual(tasks[0])
  })

  it('should return the first pending task with sequence greater than 1 if previous task is completed', () => {
    const tasks = [
      { id: '1', sequence: 1, status: AssetTaskStatus.COMPLETED, type: AssetTaskType.DOWNLOAD },
      { id: '2', sequence: 2, status: AssetTaskStatus.PENDING, type: AssetTaskType.EXTRACT }
    ]
    const result = findFirstPendingTask(tasks)
    expect(result).toEqual(tasks[1])
  })

  it('should return undefined if no tasks are pending', () => {
    const tasks = [
      { id: '1', sequence: 1, status: AssetTaskStatus.COMPLETED, type: AssetTaskType.DOWNLOAD },
      { id: '2', sequence: 2, status: AssetTaskStatus.COMPLETED, type: AssetTaskType.EXTRACT }
    ]
    const result = findFirstPendingTask(tasks)
    expect(result).toBeUndefined()
  })

  it('should return undefined if no tasks exist', () => {
    const tasks = []
    const result = findFirstPendingTask(tasks)
    expect(result).toBeUndefined()
  })

  it('should return undefined if the first task is not pending and no previous task is completed', () => {
    const tasks = [
      { id: '1', sequence: 1, status: AssetTaskStatus.FAILED, type: AssetTaskType.DOWNLOAD },
      { id: '2', sequence: 2, status: AssetTaskStatus.PENDING, type: AssetTaskType.EXTRACT }
    ]
    const result = findFirstPendingTask(tasks)
    expect(result).toBeUndefined()
  })
})
