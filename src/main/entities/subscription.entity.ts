import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'subscriptions'
})
export class SubscriptionEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  modId: string

  @Column()
  modName: string

  @Column({ type: 'varchar', nullable: true })
  exePath: string | null

  @Column({
    default: () => Date.now()
  })
  created: number

  @Column({
    default: () => Date.now()
  })
  lastModified: number
}
