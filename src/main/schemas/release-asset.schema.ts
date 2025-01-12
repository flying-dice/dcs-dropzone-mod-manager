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

  @Prop({
    type: [
      {
        source: { type: String, required: true },
        target: { type: String, required: true },
        symlinkPath: { type: String, required: true, default: null },
        runOnStart: { type: Boolean, required: false }
      }
    ],
    required: true
  })
  links: {
    source: string
    target: string
    symlinkPath: string | null
    runOnStart?: boolean
  }[]

  @Prop({ type: String })
  writeDirectoryPath?: string
}

export const ReleaseAssetSchema = SchemaFactory.createForClass(ReleaseAsset)
