import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class WindowSetting {
  @Prop({ required: true, index: true, unique: true })
  id: string

  @Prop({ type: Number })
  height: number

  @Prop({ type: Number })
  width: number

  @Prop({ type: Number })
  x: number

  @Prop({ type: Number })
  y: number

  @Prop({ type: Boolean })
  maximized: boolean
}

export const WindowSettingSchema = SchemaFactory.createForClass(WindowSetting)
