import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { SubscriptionEntity } from './subscription.entity'

@Entity({
  name: 'releases'
})
export class ReleaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => SubscriptionEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  subscription: SubscriptionEntity

  @Column()
  version: string

  @Column({ default: false })
  enabled: boolean

  @Column({
    default: () => Date.now()
  })
  created: number

  @Column({
    default: () => Date.now()
  })
  lastModified: number
}
