import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ReleaseEntity } from './release.entity'

@Entity({
  name: 'release_assets'
})
export class ReleaseAssetEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => ReleaseEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  release: ReleaseEntity

  @Column()
  source: string

  @Column()
  target: string

  @Column({
    default: () => Date.now()
  })
  created: number

  @Column({
    default: () => Date.now()
  })
  lastModified: number
}
