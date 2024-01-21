import { join } from "path";
import { EntryInstallMap } from "../client";


export const getInstalledFilePath = (basePath:string, installMap: EntryInstallMap): string => {
    const namedPath =  join(basePath, installMap.target, installMap.name.replace(".zip", ""));
    if(!installMap.zipPath) return namedPath
    var terminalFolder = installMap.zipPath.split("/").pop()
    if(!terminalFolder) return namedPath
    return join(basePath, installMap.target, terminalFolder)
  }