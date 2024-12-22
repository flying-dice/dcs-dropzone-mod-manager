import { wget } from './wget'
import { tmpdir } from 'node:os'
import { mkdir } from 'node:fs/promises'
import { upath } from './upath'
import { stat } from 'fs-extra'
import { vi } from 'vitest'
import { join } from 'node:path'

describe('wget', () => {
  const dest = upath(join(tmpdir(), 'dcs-dropzone', 'wget.test'))
  const baseUrl = `https://eternallybored.org/misc/wget/1.21.4/64`
  const file = 'wget.exe'

  let result: string
  const onProgress = vi.fn()

  beforeAll(async () => {
    await mkdir(dest, { recursive: true })

    const exePath = join(__dirname, '../../../resources', 'wget.exe')

    result = await wget({
      exePath,
      baseUrl,
      file,
      targetDir: dest,
      onProgress
    })
  }, 60000)

  it('successfully downloads file', async () => {
    expect(result).toEqual(`${dest}/${file}`)
    await expect(stat(result)).resolves.toBeDefined()
  })

  it('should call onProgress', () => {
    expect(onProgress).toHaveBeenCalled()
    expect(onProgress).toHaveBeenCalledWith({
      progress: expect.any(Number)
    })
  })
})
