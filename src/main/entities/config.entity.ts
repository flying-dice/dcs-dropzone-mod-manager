import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'configs'
})
export class ConfigEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column()
  value: string

  @Column({
    default: () => Date.now()
  })
  created: number

  @Column({
    default: () => Date.now()
  })
  lastModified: number
}
