import type { AssetTaskEntity, AssetTaskPayload } from '../entities/asset-task.entity'

export interface TaskProcessor<PAYLOAD = AssetTaskPayload> {
  process(task: AssetTaskEntity<PAYLOAD>): Promise<void>

  postProcess(task: AssetTaskEntity<PAYLOAD>): Promise<void>
}
