const Downloader = require('nodejs-file-downloader')
const unzipper = require('unzipper')
const { join } = require('path')
const fs = require('fs')
const fsp = require('fs/promises')

const workerpool = require('workerpool')
const HASH_SPLIT = '/#/'

const getInstallFileLocalPath = (installMap) => {
  let installFile = installMap.source
  if (installFile.includes(HASH_SPLIT)) {
    installFile = installFile.split(HASH_SPLIT)[1]
  }
  return installFile
}

const getInstalledFilePath = (modId, basePath, installMap) =>
  join(basePath, modId, getInstallFileLocalPath(installMap))

const downloadAndUnzip = async (modId, downloadUrl, installMapArr, installBasePath) => {
  const { filePath } = await download(modId, downloadUrl, installBasePath)
  if (filePath.endsWith('.zip')) {
    const unzippedFilePath = await unzip(filePath)
    await unpack(modId, unzippedFilePath, installBasePath, installMapArr)
    await fsp.rm(join(installBasePath, modId, unzippedFilePath), {
      //Potential edge case if unzipped is all we need but deal with it later :D
      recursive: true,
      force: true
    })
  }

  workerpool.workerEmit({
    status: 'Complete'
  })
}

const download = async (modId, downloadUrl, installBasePath) => {
  const download = new Downloader({
    url: downloadUrl,
    directory: join(installBasePath, modId),
    skipExistingFileName: downloadUrl.endsWith('.zip'), // as zips are deleted in cleanup with can do this to skip a step if errors later
    onProgress: function (percentage) {
      workerpool.workerEmit({
        status: `${percentage}%`
      })
    }
  })
  return await download.download()
}

const unzip = async (downloadedFilePath) => {
  workerpool.workerEmit({
    status: 'Unpacking'
  })
  const downloadedFileUnzipped = downloadedFilePath.replace('.zip', '')
  await fs
    .createReadStream(downloadedFilePath)
    .pipe(unzipper.Extract({ path: downloadedFileUnzipped })) // this is dumb as rocks don't like it would be nice if I could get a subset
    .promise()
  await fsp.rm(downloadedFilePath, { recursive: true, force: true })
  return downloadedFileUnzipped
}

const unpack = async (modId, unzippedFilePath, installBasePath, installMapArr) => {
  return await Promise.all(
    installMapArr.map(async (installMap) => {
      const installFile = getInstallFileLocalPath(installMap)
      return await fsp.rename(
        join(unzippedFilePath, installFile),
        getInstalledFilePath(modId, installBasePath, installMap)
      )
    })
  )
}

workerpool.worker({
  downloadAndUnzip: downloadAndUnzip
})
