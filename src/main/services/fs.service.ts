import { Injectable } from '@nestjs/common'
import { dialog, type OpenDialogReturnValue, shell } from 'electron'

/**
 * File system service for handling file system operations in the main process
 * This service is used to interact with the file system in the main process from the renderer process
 *
 * It can also be used within the main process to perform file system operations such as searching for directories
 */
@Injectable()
export class FsService {
  /**
   * Ask the user to select a folder by opening a system dialog
   * @param defaultPath The default path to open the dialog at
   */
  async askFolder(defaultPath: string): Promise<OpenDialogReturnValue | undefined> {
    return dialog.showOpenDialog({
      message: 'Select a folder',
      defaultPath,
      properties: ['openDirectory']
    })
  }

  /**
   * Open a folder in the system file explorer
   * @param p The path to open
   */
  async openFolder(p: string) {
    await shell.openPath(p)
  }
}
