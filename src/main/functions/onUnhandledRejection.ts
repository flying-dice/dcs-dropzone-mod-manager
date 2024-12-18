import { Logger } from '@nestjs/common'
import { trackEvent } from '@aptabase/electron/main'

/**
 * @see https://nodejs.org/api/process.html#event-unhandledrejection
 *
 * The 'unhandledRejection' event is emitted whenever a Promise is rejected and no error handler is attached
 * to the promise within a turn of the event loop. When programming with Promises, exceptions are encapsulated as "rejected promises".
 *
 * Rejections can be caught and handled using promise.catch() and are propagated through a Promise chain.
 * The 'unhandledRejection' event is useful for detecting and keeping track of promises that were rejected whose rejections have not yet been handled.
 *
 * @param {Error | any} reason - The object with which the promise was rejected (typically an Error object).
 */
export async function onUnhandledRejection(reason: Error | any) {
  Logger.flush()

  if (reason instanceof Error) {
    await trackEvent('unhandled_rejection', {
      name: reason.name,
      message: reason.message
    })
  } else {
    await trackEvent('unhandled_rejection', {
      name: 'Non Error UnhandledRejection',
      message: reason.toString()
    })
  }

  Logger.error(`Unhandled Rejection: ${reason.toString()}`, 'main')
}
