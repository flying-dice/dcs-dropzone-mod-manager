import { ensureDir } from 'fs-extra'
import { Logger } from '@nestjs/common'
import writeFileAtomic from 'write-file-atomic'
import { getUninstallLineForPath } from './get-uninstall-line-for-path'

/**
 * Represents an uninstallable item with an id and path.
 */
export type Uninstallable = {
  readonly id: string
  readonly path: string
}

/**
 * Class to manage the creation of an uninstall batch script.
 */
export class UninstallBat {
  private readonly logger = new Logger(UninstallBat.name)

  readonly uninstallablePaths: Uninstallable[] = []

  /**
   * Creates an instance of UninstallBat.
   * @param abspath - The absolute path where the uninstall script will be written.
   */
  constructor(private readonly abspath: string) {}

  /**
   * Adds an uninstallable item to the list.
   * @param item - The uninstallable item to add.
   */
  addItem(item: Uninstallable): void {
    this.uninstallablePaths.push(item)
  }

  /**
   * Generates the content of the uninstall script.
   * @returns A promise that resolves to the content of the uninstall script.
   */
  async getContent(): Promise<string> {
    const fileContent: string[] = await Promise.all(
      this.uninstallablePaths.map(({ path }) => getUninstallLineForPath(path))
    )

    return fileContent.join('\n')
  }

  /**
   * Writes the uninstall script to the specified path.
   * @returns A promise that resolves when the script has been written.
   */
  async write(): Promise<void> {
    const fileContent = await this.getContent()
    this.logger.debug(`Writing uninstall script`)
    await ensureDir(this.abspath)
    await writeFileAtomic(this.abspath, fileContent)
  }
}
