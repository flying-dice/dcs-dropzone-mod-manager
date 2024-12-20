/**
 * Delays the execution of an asynchronous function by a specified number of milliseconds.
 *
 * This function returns a Promise that resolves after the specified delay.
 * It can be used to introduce a delay in asynchronous operations.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
