/**
 * Retrieves the value of an environment variable.
 *
 * This function takes the name of an environment variable as input and returns its value.
 * If the environment variable does not exist, it returns `undefined`.
 *
 * @param {string} name - The name of the environment variable to retrieve.
 * @returns {string | undefined} The value of the environment variable, or `undefined` if it does not exist.
 */
export function getEnvironmentVariable(name: string): string | undefined {
  return process.env[name]
}
