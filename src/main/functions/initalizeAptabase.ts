import { Logger } from '@nestjs/common'
import { initialize } from '@aptabase/electron/main'

/**
 * Initializes Aptabase with the provided environment variables.
 *
 * This function checks if the `MAIN_VITE_APTABASE_APP_KEY` environment variable is provided.
 * If the app key is present, it logs the initialization process, initializes Aptabase with the app key,
 * and logs the successful initialization with the app key masked for security.
 * If the app key is not provided, it logs a warning and skips the initialization.
 *
 * @param {Partial<ImportMetaEnv>} [importMetaEnv=import.meta.env] - The environment variables to use for initialization.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 */
export async function initalizeAptabase(
  importMetaEnv: Partial<ImportMetaEnv> = import.meta.env
): Promise<void> {
  if (importMetaEnv.MAIN_VITE_APTABASE_APP_KEY) {
    Logger.log('Initializing Aptabase', 'initalizeAptabase')
    await initialize(importMetaEnv.MAIN_VITE_APTABASE_APP_KEY)
    Logger.log(
      `Aptabase initialized ${importMetaEnv.MAIN_VITE_APTABASE_APP_KEY?.replace(/\d/g, '*')}`,
      'initalizeAptabase'
    )
  } else {
    Logger.warn('No Aptabase app key provided, skipping initialization', 'initalizeAptabase')
  }
}
