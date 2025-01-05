/**
 * Converts Windows-style paths to Unix-style paths by replacing backslashes with forward slashes.
 *
 * @param {string} path - The Windows-style path to be converted.
 * @returns {string} - The converted Unix-style path.
 */
export function posixpath(path: string): string {
  return path.replace(/\\/g, '/')
}
