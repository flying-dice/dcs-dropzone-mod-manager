import { Logger } from '@nestjs/common'
import axios from 'axios'

/**
 * Tracing decorator to log method execution details.
 */
export const Log =
  (logger?: Logger) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const _logger = logger || new Logger(target.constructor.name)

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()

      // _logger.verbose(
      //   `Method ${propertyKey} called with arguments: ${args.map((it) => `${it}`).join(', ')}`
      // )

      try {
        const result = await originalMethod.apply(this, args)
        // const endTime = Date.now()
        // _logger.verbose(`Method ${propertyKey} executed successfully in ${endTime - startTime}ms`)
        return result
      } catch (error) {
        const endTime = Date.now()
        _logger.error(
          `Method ${propertyKey} failed after ${endTime - startTime}ms with error: ${error.message}`
        )

        if (axios.isAxiosError(error)) {
          _logger.error(` - AxiosError: ${JSON.stringify(error.response?.data)}`)
        }
        throw error
      }
    }

    return descriptor
  }
