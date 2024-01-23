const  Downloader =  require("nodejs-file-downloader")
const  unzipper =  require('unzipper')
const  { join } =  require("path");
const  fs =  require("fs")
const  fsp =  require("fs/promises")

const workerpool = require('workerpool');

const getInstalledFilePath = (modId ,basePath, installMap) => {
  const namedPath =  join(basePath, modId, installMap.name.replace(".zip", ""));
  if(!installMap.zipPath) return namedPath
  var terminalFolder = installMap.zipPath.split("/").pop()
  if(!terminalFolder) return namedPath
  return join(basePath, modId, terminalFolder)
}

const downloadAndUnzip = async (modId, githubPage, tag, installMap, installBasePath) => {
    const download = new Downloader({
      url: join(githubPage, "releases", "download", tag, installMap.name),
      directory: join(installBasePath, modId),
      skipExistingFileName: installMap.name.endsWith(".zip"), // as zips are deleted in cleanup with can do this to skip a step if errors laterp
      onProgress: function (percentage) {
        workerpool.workerEmit({
            status: `${percentage}%`,
          });
      },
    });
    await download.download();
    if(installMap.name.endsWith(".zip"))
    {
        workerpool.workerEmit({
            status: 'Unpacking',
          });
      await fs.createReadStream(join(installBasePath, modId, installMap.name)) 
        .pipe(unzipper.Extract({ path: join(installBasePath, modId, installMap.name.replace(".zip", ""))})) // this is dumb as rocks don't like it would be nice if I could get a subset
        .promise()
      await fsp.rm(join(installBasePath, modId, installMap.name),  { recursive: true, force: true })
  
      if(installMap.zipPath) {
        await fsp.rename(join(installBasePath, modId, installMap.name.replace(".zip", ""), installMap.zipPath), getInstalledFilePath(modId, installBasePath, installMap))
        await fsp.rm(join(installBasePath, modId, installMap.name.replace(".zip", "")),  { recursive: true, force: true })
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