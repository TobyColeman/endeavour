import 'reflect-metadata'

import { sleep } from './backoff'
import { EndeavourRunnable, EndeavourCallback } from './runnable'
import { EndeavourOpts, getEndeavourArgs, getRunnableArgs } from './config'
import { Operation, Endeavour } from './endeavour'

let endeavour: Endeavour

/**
 * Creates Fault-tolerant function
 */
endeavour = function endeavour<R>(
  this: any,
  operation: Operation<R>,
  optsOrCtx: any = {},
  ctx?: any
): EndeavourRunnable<R> {
  async function runnable(this: any, ...args: Array<any>) {
    // helper function to update/cancel an operation if some intercept
    // is defined
    const next = (arg: Error | Array<any>): Promise<Array<any>> => {
      if (arg instanceof Error) {
        return Promise.reject(arg)
      }
      return Promise.resolve(arg)
    }
    // configuration options for running the operation
    const { opts, operationCtx, backoff } = getEndeavourArgs(optsOrCtx, ctx)
    let { interceptArgs, intercept } = getRunnableArgs(args)

    let attempts = 0

    while (true) {
      attempts += 1

      try {
        return await operation.apply(operationCtx || this, interceptArgs)
      } catch (error) {
        const nextDelay = backoff(attempts)

        if (intercept) {
          try {
            interceptArgs = await intercept(
              { error, attempt: attempts, nextDelay },
              next
            )
          } catch (error) {
            return Promise.reject(error)
          }
        }

        if (opts.forever || attempts < opts.retries) {
          await sleep(nextDelay)
          continue
        }

        return Promise.reject(
          new Error(`Failed to execute operation after ${attempts} attempts`)
        )
      }
    }
  }

  return runnable
}

/**
 * Decorator for defining endeavour options for a set of methods
 * that belong to some class.
 */
export function endeavourable(options: EndeavourOpts) {
  return function(target: Function) {
    Reflect.defineMetadata('endeavourOptions', options, target)
  }
}

/**
 * Wraps some class method with endeavour. If no options are provided,
 * options defined with @endeavourable will be used, or the defaults
 * provided by endeavour().
 */
export function endeavourify(options: EndeavourOpts = {}) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const original = descriptor.value
    let wrapped: Function

    descriptor.value = async function(...args: Array<any>) {
      if (!wrapped) {
        wrapped = endeavour(original, {
          ...Reflect.getMetadata('endeavourOptions', this.constructor),
          ...options
        })
      }
      return wrapped.bind(this)(args)
    }

    return descriptor
  }
}

export default endeavour

export { EndeavourRunnable, EndeavourCallback, Next } from './runnable'
