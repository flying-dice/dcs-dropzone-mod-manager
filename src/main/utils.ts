import { join } from "path";
import { EntryInstallMap } from "../client";


export const getInstalledFilePath = (modId: string ,basePath: string, installMap: EntryInstallMap): string => {
  const namedPath =  join(basePath, modId, installMap.name.replace(".zip", ""));
  if(!installMap.zipPath) return namedPath
  var terminalFolder = installMap.zipPath.split("/").pop()
  if(!terminalFolder) return namedPath
  return join(basePath, modId, terminalFolder)
}

export const getSymlinkFilePath = (basePath: string, installMap: EntryInstallMap): string => {
  const namedPath =  join(basePath, installMap.target, installMap.name.replace(".zip", ""));
  if(!installMap.zipPath) return namedPath
  var terminalFolder = installMap.zipPath.split("/").pop()
  if(!terminalFolder) return namedPath
  return join(basePath, installMap.target, terminalFolder)
}