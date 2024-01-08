module.exports = {
  registry: {
    input: 'http://127.0.0.1:8080/schema.json', // Get this by running dev in the https://github.com/flying-dice/dcs-dropzone-registry repo
    output: {
      target: 'src/client.ts',
      client: 'swr'
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write'
    }
  }
}
