import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ReleaseAssetEntity } from './release-asset.entity'

export enum AssetTaskType {
  DOWNLOAD = 'download',
  EXTRACT = 'extract'
}

export enum AssetTaskStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  FAILED = 3
}

export type DownloadTaskPayload = {
  file: string
  baseUrl: string
  folder: string
}

export type ExtractTaskPayload = {
  file: string
  folder: string
}

export type AssetTaskPayload = DownloadTaskPayload | ExtractTaskPayload

@Entity({
  name: 'asset_tasks'
})
export class AssetTaskEntity<PAYLOAD = AssetTaskPayload> {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: AssetTaskType

  @Column()
  sequence: number

  @Column()
  label: string

  @Column({
    default: 0
  })
  progress: number

  @Column({
    default: AssetTaskStatus.PENDING
  })
  status: AssetTaskStatus

  @ManyToOne(() => ReleaseAssetEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  releaseAsset: ReleaseAssetEntity

  @Column({
    type: 'json',
    transformer: {
      to(value: any): any {
        return JSON.stringify(value)
      },
      from(value: any): any {
        return JSON.parse(value)
      }
    }
  })
  payload: PAYLOAD
}
