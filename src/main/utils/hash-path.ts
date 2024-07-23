import { basename, dirname, extname } from 'path'
import { _7zip } from '../tools/7zip'

export class HashPath {
  constructor(private readonly path: string) {}

  static isHashPath(path: string) {
    return path.includes('\\#\\')
  }

  get basePath() {
    return this.path.split('\\#\\')[0]
  }

  get baseName() {
    return basename(this.basePath)
  }

  get baseDirname() {
    return dirname(this.basePath)
  }

  get baseExtname() {
    return extname(this.basePath)
  }

  get baseNameWithoutExt() {
    return this.baseName.replace(this.baseExtname, '')
  }

  get basePathWithoutExt() {
    return this.basePath.replace(this.baseExtname, '')
  }

  get hashPath() {
    return this.path.split('\\#\\')[1]
  }

  get isArchive() {
    console.log(this.baseExtname)
    return _7zip.SUPPORTED_ARCHIVE_EXTENSIONS.includes(this.baseExtname.replace('.', ''))
  }
}
