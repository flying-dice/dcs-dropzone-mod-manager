import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export enum AssetTaskType {
  DOWNLOAD = 'download',
  EXTRACT = 'extract'
}

export enum AssetTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export type DownloadTaskPayload = {
  file: string
  baseUrl: string
  folder: string
}

export type ExtractTaskPayload = {
  file: string
  folder: string
}

export type AssetTaskPayload = DownloadTaskPayload | ExtractTaskPayload

@Schema({ timestamps: true })
export class AssetTask<T extends AssetTaskPayload = AssetTaskPayload> {
  @Prop({ type: String, required: true, index: true, unique: true })
  id: string

  @Prop({ type: String, required: true })
  releaseId: string

  @Prop({ type: String, required: true })
  subscriptionId: string

  @Prop({ type: String, required: true })
  releaseAssetId: string

  @Prop({ type: String, enum: AssetTaskType, required: true })
  type: AssetTaskType

  @Prop({ required: true, type: Object })
  payload: T

  @Prop({ type: Number, required: true })
  sequence: number

  @Prop({ type: String, required: true })
  label: string

  @Prop({ type: Number, required: true, default: 0 })
  progress: number

  @Prop({ type: String, enum: AssetTaskStatus, required: true, default: AssetTaskStatus.PENDING })
  status: AssetTaskStatus
}

export const AssetTaskSchema = SchemaFactory.createForClass(AssetTask)
