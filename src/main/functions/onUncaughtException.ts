import { Logger } from '@nestjs/common'
import { readFile } from 'fs-extra'
import { trackEvent } from '@aptabase/electron/main'
import { showError } from './show-error'
import { filename } from '../logging'

/**
 * Handles uncaught exceptions by logging the error, tracking the event, and displaying the error.
 *
 * This function performs the following steps:
 * 1. Flushes the logger to ensure all logs are written.
 * 2. Reads the recent logs from the log file.
 * 3. Tracks the uncaught exception event with the error details.
 * 4. Displays the error along with the recent logs.
 *
 * @param {Error | any} err - The error object or any other type of error information.
 * @returns {Promise<void>} A promise that resolves when the error handling is complete.
 */
export async function onUncaughtException(err: Error | any): Promise<void> {
  Logger.flush()
  const fileContent = await readFile(filename).then((buffer) => buffer.toString('utf-8'))
  const recentLogs = fileContent.split('\n'.slice(-10))

  await trackEvent('uncaught_exception', {
    name: err.name,
    message: err.message
  })

  showError(err, recentLogs)
}
