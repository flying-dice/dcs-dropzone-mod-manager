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

  /**
   * TODO: Remove this after no daily starts with 1.18.0 (Check Aptabase Dash) Due for review 30/02/2024
   * @deprecated after v1.18.0 mods with symlinkPath should be re-subscribed
   */
  @Prop({ type: String, required: false })
  symlinkPath?: string | null

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
