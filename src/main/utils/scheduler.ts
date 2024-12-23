import { event, EventEmitter2, eventNS } from 'eventemitter2'

export class Scheduler {
  private intervalId: NodeJS.Timeout | null = null

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly event: event | eventNS,
    private readonly interval: number
  ) {}

  start(): void {
    if (this.intervalId == null) {
      this.intervalId = setInterval(() => {
        this.eventEmitter.emit(this.event)
      }, this.interval)
    }
  }

  stop(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
