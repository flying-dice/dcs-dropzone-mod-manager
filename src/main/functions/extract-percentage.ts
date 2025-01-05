/**
 * Extracts the percentage value from a given string.
 *
 * @param {string} input - The input string containing the percentage.
 * @returns {number | undefined} - The extracted percentage as a rounded number, or undefined if no percentage is found.
 */
export function extractPercentage(input: string): number | undefined {
  const percentagePattern = /(\d+(\.\d+)?%)/g

  const matches = input.match(percentagePattern)

  if (matches) {
    const lastMatch = matches[matches.length - 1]
    const numericValue = parseFloat(lastMatch)
    return +numericValue.toFixed(0)
  }

  return undefined
}
