const  Downloader =  require("nodejs-file-downloader")
const  unzipper =  require('unzipper')
const  { join } =  require("path");
const  fs =  require("fs")
const  fsp =  require("fs/promises")

const workerpool = require('workerpool');
const HASH_SPLIT = '/#/'

const getInstalledFilePath = (modId ,basePath, installMap) => {
  let installFile = installMap.source
  if(installFile.includes(HASH_SPLIT)) {
    installFile = installFile.split(HASH_SPLIT)[1]
  }
  return join(basePath, modId, installFile)
}

const downloadAndUnzip = async (modId, installMap, installBasePath) => {
  let downloadPath = installMap.source
  let installFile = installMap.source
  if(installFile.includes(HASH_SPLIT)) {
    const  parts = installFile.split(HASH_SPLIT)
    installFile = parts[1]
    downloadPath = parts[0]
  }
    const download = new Downloader({
      url: downloadPath,
      directory: join(installBasePath, modId),
      skipExistingFileName: downloadPath.endsWith(".zip"), // as zips are deleted in cleanup with can do this to skip a step if errors laterp
      onProgress: function (percentage) {
        workerpool.workerEmit({
            status: `${percentage}%`,
          });
      },
    });
    await download.download();
    if(downloadPath.endsWith(".zip"))
    {
        workerpool.workerEmit({
            status: 'Unpacking',
          });
        const downloadedFile = downloadPath.split('/').pop();
        const downloadedFileUnzipped = downloadedFile.replace(".zip", "")
      await fs.createReadStream(join(installBasePath, modId, downloadedFile)) 
        .pipe(unzipper.Extract({ path: join(installBasePath, modId,downloadedFileUnzipped)})) // this is dumb as rocks don't like it would be nice if I could get a subset
        .promise()
      await fsp.rm(join(installBasePath, modId, downloadedFile),  { recursive: true, force: true })
  
      if(downloadedFileUnzipped !== installFile) {
        await fsp.rename(join(installBasePath, modId, downloadedFileUnzipped, installFile), getInstalledFilePath(modId, installBasePath, installMap))
        await fsp.rm(join(installBasePath, modId, downloadedFileUnzipped),  { recursive: true, force: true })
      } 
    }
    workerpool.workerEmit({
        status: 'Complete',
      });
    return getInstalledFilePath(modId, installBasePath, installMap)
  }

  workerpool.worker({
    downloadAndUnzip: downloadAndUnzip,
  });