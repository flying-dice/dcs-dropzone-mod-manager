import { join } from "path";
import { EntryInstallMap } from "../client";


export const getInstalledFilePath = (modId: string ,basePath: string, installMap: EntryInstallMap): string => {
  let installFile = installMap.source
  if(installFile.includes('#')) {
    installFile = installFile.split('#')[1]
  }
  return join(basePath, modId, installFile)
}

export const getSymlinkFilePath = (basePath: string, installMap: EntryInstallMap): string => {
  return join(basePath, installMap.target)
}
