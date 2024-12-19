export class ModDisabledEvent {
  constructor(
    public readonly modId: string,
    public readonly version: string
  ) {}
}
