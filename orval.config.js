module.exports = {
  registry: {
    input: 'https://dcs-dropzone.app/v3/api-docs', // Get this locally by running dev in the https://github.com/flying-dice/dcs-dropzone-registry repo
    output: {
      target: 'src/lib/client.ts',
      client: 'swr'
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write'
    }
  }
}
