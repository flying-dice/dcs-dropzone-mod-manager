import { AssetTask, AssetTaskPayload } from '../schemas/release-asset-task.schema'

export interface TaskProcessor<PAYLOAD extends AssetTaskPayload = AssetTaskPayload> {
  process(task: AssetTask<PAYLOAD>): Promise<void>
  postProcess(task: AssetTask<PAYLOAD>): Promise<void>
}
