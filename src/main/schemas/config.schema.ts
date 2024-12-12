import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class Config {
  @Prop({ required: true, unique: true, index: true })
  name: string

  @Prop({ required: true })
  value: string
}

export const ConfigSchema = SchemaFactory.createForClass(Config)
