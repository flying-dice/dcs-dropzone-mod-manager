import { describe, expect, it } from 'vitest'
import { HashPath } from './hash-path'

describe('HashPath', () => {
  it('should correctly identify hash paths', () => {
    expect(HashPath.isHashPath('C:\\Users\\file\\#\\hash')).toBe(true)
    expect(HashPath.isHashPath('C:\\Users\\file\\hash')).toBe(false)
  })

  it('should correctly initialize and access properties', () => {
    const hashPath = new HashPath('C:\\Users\\file.zip\\#\\hash')

    expect(hashPath.basePath).toBe('C:\\Users\\file.zip')
    expect(hashPath.baseName).toBe('file.zip')
    expect(hashPath.baseDirname).toBe('C:\\Users')
    expect(hashPath.baseExtname).toBe('.zip')
    expect(hashPath.baseNameWithoutExt).toBe('file')
    expect(hashPath.basePathWithoutExt).toBe('C:\\Users\\file')
    expect(hashPath.hashPath).toBe('hash')
  })

  it('should correctly identify archive files', () => {
    const zipHashPath = new HashPath('C:\\Users\\file.zip\\#\\hash')
    expect(zipHashPath.isArchive).toBe(true)

    const txtHashPath = new HashPath('C:\\Users\\file.txt\\#\\hash')
    expect(txtHashPath.isArchive).toBe(false)
  })

  it('should handle empty hash path', () => {
    const hashPath = new HashPath('C:\\Users\\file.zip\\#\\')
    expect(hashPath.basePath).toBe('C:\\Users\\file.zip')
    expect(hashPath.hashPath).toBe('') // Empty hash part
  })
})
