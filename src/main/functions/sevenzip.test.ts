import { tmpdir } from 'node:os'
import { mkdir } from 'node:fs/promises'
import { posixpath } from './posixpath'
import { stat } from 'fs-extra'
import { vi } from 'vitest'
import { join } from 'node:path'
import { sevenzip } from './sevenzip'

describe('sevenzip', () => {
  const dest = posixpath(join(tmpdir(), 'dcs-dropzone', 'sevenzip.test'))
  const archivePath = join(__dirname, '__tests__', './hello-world.zip')

  let result: string
  const onProgress = vi.fn()

  beforeAll(async () => {
    await mkdir(dest, { recursive: true })

    const exePath = join(__dirname, '../../../resources', '7za.exe')

    result = await sevenzip({
      exePath,
      archivePath,
      targetDir: dest,
      onProgress
    })
  }, 60000)

  it('successfully downloads file', async () => {
    expect(result).toEqual(dest)
    await expect(stat(result)).resolves.toBeDefined()
    await expect(stat(join(result, 'hello-world', 'hello-world.txt'))).resolves.toBeDefined()
  })

  it('should call onProgress', () => {
    expect(onProgress).toHaveBeenCalled()
    expect(onProgress).toHaveBeenCalledWith({
      progress: expect.any(Number)
    })
  })
})
