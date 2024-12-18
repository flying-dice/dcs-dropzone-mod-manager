import { Logger } from '@nestjs/common'

export function verifyExistsBefore(content: string, line: string, before: string): boolean {
  Logger.verbose(`Verifying if line ${line} exists before ${before}`)

  const lines = content.split('\n').map((it) => it.trim())

  const indexOfBefore = lines.indexOf(before.trim())
  const indexOfLine = lines.indexOf(line.trim())

  if (indexOfBefore === -1 || indexOfLine === -1) {
    Logger.verbose(`Line ${line} or before ${before} not found in content`)
    return false
  }

  Logger.verbose(
    `Line ${line} found at ${indexOfLine} and before ${before} found at ${indexOfBefore}`
  )

  return indexOfLine < indexOfBefore
}
