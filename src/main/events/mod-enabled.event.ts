export class ModEnabledEvent {
  constructor(
    public readonly modId: string,
    public readonly version: string
  ) {}
}
