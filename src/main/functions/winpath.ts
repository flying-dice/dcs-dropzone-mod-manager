/**
 * Converts Unix-style paths to Windows-style paths by replacing forward slashes with backslashes.
 *
 * @param {string} path - The Unix-style path to be converted.
 * @returns {string} - The converted Windows-style path.
 */
export function winpath(path: string): string {
  return path.replace(/\//g, '\\')
}
