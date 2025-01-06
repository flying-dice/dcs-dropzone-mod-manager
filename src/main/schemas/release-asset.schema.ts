import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class ReleaseAsset {
  @Prop({ type: String, required: true, index: true, unique: true })
  id: string

  @Prop({ type: String, required: true })
  releaseId: string

  @Prop({ type: String, required: true })
  remoteSource: string

  @Prop({ type: String, required: true })
  subscriptionId: string

  @Prop({ type: String, required: true })
  source: string

  @Prop({ type: String, required: true })
  target: string

  @Prop({ type: String, required: true, default: null })
  symlinkPath: string | null

  @Prop({ type: Boolean, required: false })
  runOnStart?: boolean

  @Prop({ type: String })
  writeDirectoryPath?: string
}

export const ReleaseAssetSchema = SchemaFactory.createForClass(ReleaseAsset)
