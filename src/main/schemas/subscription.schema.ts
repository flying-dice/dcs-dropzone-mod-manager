import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, index: true, unique: true })
  id: string

  @Prop({ required: true, index: true })
  modId: string

  @Prop({ required: true })
  modName: string

  @Prop({ required: true })
  created: number

  @Prop({ type: String })
  writeDirectory?: string
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription)
