export class ModEnabledEvent {
  readonly modId: string
  readonly version: string

  constructor(modId, version) {
    this.modId = modId
    this.version = version
  }
}
