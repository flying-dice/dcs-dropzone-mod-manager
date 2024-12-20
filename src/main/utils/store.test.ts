import { beforeEach, describe, expect, it } from 'vitest'
import mockFs from 'mock-fs'
import { Store } from './store'
import { gzipSync } from 'node:zlib'
import { readFileSync } from 'fs'
import { z } from 'zod'

const testFile = 'test-store.json'

describe('Store', () => {
  describe('With Compression Enabled', () => {
    let store: Store<number>

    beforeEach(async () => {
      mockFs({
        [testFile]: ''
      })
      store = await Store.new(testFile, z.number(), { withCompression: true })
    })

    afterEach(() => {
      mockFs.restore()
    })

    it('should set and get a value', () => {
      store.set('key1', 1)
      expect(store.get('key1')).toBe(1)
    })

    it('should return true if a key exists', () => {
      store.set('key2', 42)
      expect(store.has('key2')).toBe(true)
    })

    it('should return false if a key does not exist', () => {
      expect(store.has('key3')).toBe(false)
    })

    it('should delete a key', () => {
      store.set('key4', 1)
      expect(store.delete('key4')).toBe(true)
      expect(store.has('key4')).toBe(false)
    })

    it('should clear all keys', () => {
      store.set('key1', 1)
      store.set('key2', 42)
      store.clear()
      expect(store.has('key1')).toBe(false)
      expect(store.has('key2')).toBe(false)
    })

    it('should return all keys', () => {
      store.set('key1', 1)
      store.set('key2', 42)
      const keys = Array.from(store.keys())
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    it('should load data from file', async () => {
      const compressedData = Buffer.from(gzipSync(JSON.stringify({ key1: 1, key2: 42 })))
      mockFs({ [testFile]: compressedData })
      const store = await Store.load(testFile, z.number(), { withCompression: true })
      expect(store.get('key1')).toBe(1)
      expect(store.get('key2')).toBe(42)
    })

    it('should write data to file', async () => {
      mockFs({ [testFile]: '' })

      store.set('key1', 1)
      store.set('key2', 42)
      await store.write()
      const compressedData = readFileSync(testFile, 'utf-8')

      expect(compressedData).toEqual(
        gzipSync(JSON.stringify({ key1: 1, key2: 42 })).toString('utf-8')
      )
    })
  })

  describe('With Compression Disabled', () => {
    let store: Store<number>

    beforeEach(async () => {
      mockFs({
        [testFile]: ''
      })
      store = await Store.new(testFile, z.number(), { withCompression: false })
    })

    afterEach(() => {
      mockFs.restore()
    })

    it('should set and get a value', () => {
      store.set('key1', 1)
      expect(store.get('key1')).toBe(1)
    })

    it('should return true if a key exists', () => {
      store.set('key2', 42)
      expect(store.has('key2')).toBe(true)
    })

    it('should return false if a key does not exist', () => {
      expect(store.has('key3')).toBe(false)
    })

    it('should delete a key', () => {
      store.set('key4', 1)
      expect(store.delete('key4')).toBe(true)
      expect(store.has('key4')).toBe(false)
    })

    it('should clear all keys', () => {
      store.set('key1', 1)
      store.set('key2', 42)
      store.clear()
      expect(store.has('key1')).toBe(false)
      expect(store.has('key2')).toBe(false)
    })

    it('should return all keys', () => {
      store.set('key1', 1)
      store.set('key2', 42)
      const keys = Array.from(store.keys())
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    it('should load data from file', async () => {
      const data = Buffer.from(JSON.stringify({ key1: 1, key2: 42 }))
      mockFs({ [testFile]: data })
      const store = await Store.load(testFile, z.number(), { withCompression: false })
      expect(store.get('key1')).toBe(1)
      expect(store.get('key2')).toBe(42)
    })

    it('should write data to file', async () => {
      mockFs({ [testFile]: '' })

      store.set('key1', 1)
      store.set('key2', 42)
      await store.write()
      const data = readFileSync(testFile, 'utf-8')

      expect(data).toEqual(JSON.stringify({ key1: 1, key2: 42 }))
    })
  })
})
