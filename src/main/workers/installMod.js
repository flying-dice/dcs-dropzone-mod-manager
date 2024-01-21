const  Downloader =  require("nodejs-file-downloader")
const  unzipper =  require('unzipper')
const  { join } =  require("path");
const  fs =  require("fs")

const workerpool = require('workerpool');

const getInstalledFilePath = (basePath, installMap) => {
  const namedPath =  join(basePath, installMap.target, installMap.name.replace(".zip", ""));
  if(!installMap.zipPath) return namedPath
  var terminalFolder = installMap.zipPath.split("/").pop()
  if(!terminalFolder) return namedPath
  return join(basePath, installMap.target, terminalFolder)
}

const downloadAndUnzip = async (githubPage, tag, installMap, installBasePath) => {
    const download = new Downloader({
      url: join(githubPage, "releases", "download", tag, installMap.name),
      directory: join(installBasePath, installMap.target),
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
      await fs.createReadStream(join(installBasePath, installMap.target, installMap.name)) 
        .pipe(unzipper.Extract({ path: join(installBasePath, installMap.target, installMap.name.replace(".zip", ""))})) // this is dumb as rocks don't like it would be nice if I could get a subset
        .promise()
      fs.rmSync(join(installBasePath, installMap.target, installMap.name),  { recursive: true, force: true })
  
      if(installMap.zipPath) {
        fs.renameSync(join(installBasePath, installMap.target, installMap.name.replace(".zip", ""), installMap.zipPath), getInstalledFilePath(installBasePath, installMap))
        fs.rmSync(join(installBasePath, installMap.target, installMap.name.replace(".zip", "")),  { recursive: true, force: true })
      } 
    }
    workerpool.workerEmit({
        status: 'Complete',
      });
    return getInstalledFilePath(installBasePath, installMap)
  }

  workerpool.worker({
    downloadAndUnzip: downloadAndUnzip,
  });