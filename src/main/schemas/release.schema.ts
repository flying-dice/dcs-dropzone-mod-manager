import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class Release {
  @Prop({ type: String, required: true, index: true, unique: true })
  id: string

  @Prop({ type: String, required: true })
  subscriptionId: string

  @Prop({ type: String, required: true })
  version: string

  @Prop({ type: Boolean, required: true, default: false })
  enabled: boolean

  @Prop({ type: String })
  exePath?: string

  @Prop({ type: String })
  writeDirectory?: string
}

export const ReleaseSchema = SchemaFactory.createForClass(Release)
