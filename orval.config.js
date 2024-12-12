module.exports = {
  registry: {
    input: 'https://dcs-mod-manager-registry.pages.dev/schema.json', // Get this locally by running dev in the https://github.com/flying-dice/dcs-dropzone-registry repo
    output: {
      target: 'src/lib/client.ts',
      client: 'swr'
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write'
    }
  }
}
