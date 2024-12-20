import { Logger } from '@nestjs/common'
import writeFileAtomic from 'write-file-atomic'
import { gunzipSync, gzipSync } from 'node:zlib'
import { ZodSchema } from 'zod'
import { pathExists, readFile } from 'fs-extra'

async function readExisting(filename: string, withCompression: boolean): Promise<any> {
  let buffer = await readFile(filename)

  if (withCompression) {
    Logger.verbose(`Decompressing data from ${filename}`)
    buffer = gunzipSync(buffer)
  }

  Logger.verbose(`Parsing data from ${filename}`)
  return JSON.parse(buffer.toString('utf-8'))
}

async function writeFile(filename: string, data: any, withCompression: boolean): Promise<void> {
  let buffer = Buffer.from(JSON.stringify(data), 'utf-8')

  if (withCompression) {
    Logger.verbose(`Compressing data to ${filename}`)
    buffer = gzipSync(buffer)
  }

  Logger.verbose(`Writing data to ${filename}`)
  await writeFileAtomic(filename, buffer)
}

export type StoreProps = {
  withCompression?: boolean
}

export class Store<T> {
  private readonly store: Map<string, T>

  private readonly withCompression: boolean

  protected constructor(
    private readonly filename: string,
    private readonly recordSchema: ZodSchema<T>,
    content: Map<string, T>,
    props?: StoreProps
  ) {
    this.store = content
    for (const [key, value] of Object.entries(content)) {
      this.store.set(key, this.recordSchema.parse(value))
    }
    this.withCompression = props?.withCompression ?? true
  }

  set(key: string, value: T) {
    this.store.set(key, this.recordSchema.parse(value))
  }

  get(key: string): T {
    return this.store.get(key) as T
  }

  has(key: string) {
    return this.store.has(key)
  }

  delete(key: string) {
    return this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }

  keys() {
    return this.store.keys()
  }

  static async new<T>(
    filename: string,
    recordSchema: ZodSchema<T>,
    props?: StoreProps
  ): Promise<Store<T>> {
    return new Store(filename, recordSchema, new Map<string, T>(), props)
  }

  static async load<T>(
    filename: string,
    recordSchema: ZodSchema<T>,
    props?: StoreProps
  ): Promise<Store<T>> {
    Logger.debug(`Loading Store from ${filename}`)

    let data: any

    if (await pathExists(filename)) {
      data = await readExisting(filename, props?.withCompression ?? true)
    }

    const content = new Map<string, T>()

    for (const [key, value] of Object.entries(data)) {
      const { data, error } = recordSchema.safeParse(value)
      if (data) {
        content.set(key, data)
      } else {
        Logger.error(`Failed to parse data for key: ${key}, value: ${value}, skipping...`)
        Logger.error(`Error: ${error}`)
      }
    }
    return new Store(filename, recordSchema, content, props)
  }

  async write(): Promise<void> {
    try {
      Logger.debug(`Writing Store to ${this.filename}`)
      await writeFile(this.filename, Object.fromEntries(this.store), this.withCompression)
    } catch (error) {
      Logger.error(`Failed to write data: ${error.message}`)
    }
  }
}
