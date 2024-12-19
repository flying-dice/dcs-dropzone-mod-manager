/**
 * Converts backslashes in a file path to forward slashes.
 *
 * This function takes a file path as input and replaces all backslashes (`\`) with forward slashes (`/`).
 * It is useful for normalizing file paths across different operating systems.
 *
 * In a Windows environment, file paths typically use backslashes (`\`) as separators. However, many tools and libraries,
 * especially those that are cross-platform, expect forward slashes (`/`). Using this function helps ensure compatibility
 * and prevents potential issues when working with such tools and libraries.
 *
 * Additionally, when using paths in LUA backslashes are treated as escape characters and can cause issues needing yet more escaping, this function can help avoid that by converting all backslashes to forward slashes.
 *
 * @param {string} path - The file path to be converted.
 * @returns {string} The converted file path with forward slashes.
 */
export function upath(path: string) {
  return path.replace(/\\/g, '/')
}
