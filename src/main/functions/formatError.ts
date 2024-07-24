export function formatError(error: Error): Record<string, string | undefined> {
  return {
    name: error.name,
    stack: error.stack,
    message: error.message
  }
}
