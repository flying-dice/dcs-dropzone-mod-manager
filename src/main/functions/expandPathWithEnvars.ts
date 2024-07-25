export const expandPathWithEnvars = (path: string) => {
  if (typeof path !== 'string') {
    throw new Error('Invalid path')
  }

  // If Windows platform
  if (path.match(/%([^%]+)%/g)) {
    return path.replace(/%([^%]+)%/g, (match, key) => process.env[key] || match)
  }

  // Otherwise use Unix based path with $
  return path.replace(/\$([A-Za-z_][A-Za-z0-9_]+)/g, (match, key) => process.env[key] || match)
}
