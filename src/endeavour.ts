import { sleep } from './backoff'
import { EndeavourRunnable, EndeavourCallback } from './runnable'
import { EndeavourOpts, getEndeavourArgs, getRunnableArgs } from './config'

/**
 * Some function that returns a promise
 */
export interface Operation<R> {
  (...args: Array<any>): Promise<R>
}

/**
 * Creates a fault tolerant Operation.
 */
export interface Endeavour {
  /**
   * Wraps an asychronous function, allowing it to be retried upon failure.
   * @param operation The function to retry.
   * @example
   * ```typescript
   * // By default this will return a wrapped async function
   * // with exponential backoff.
   * // {
   * //  retries: 10,
   * //  forever: false,
   * //  type: 'exponential',
   * //  constant: 2,
   * //  minTimeout: 1000,
   * //  maxTimeout: Infinity,
   * //  args: []
   * // }
   * const faultTolerantOperation = endeavour(asyncThing)
   * ```
   */
  <R>(operation: Operation<R>): EndeavourRunnable<R>
  /**
   * Wraps an asychronous function, allowing it to be retried upon failure.
   * @param operation The function to retry.
   * @param opts Config options for how the function should be retried.
   * @example
   * ```typescript
   * // A fault tolerant operation using linear backoff.
   * // unspecified params are given defaults, like the
   * // first example.
   * const faultTolerantOperation = endeavour(asyncThing, {
   *  forever: true,
   *  type: 'linear',
   *  maxTimeout: 5000
   * })
   * ```
   */
  <R>(operation: Operation<R>, opts: EndeavourOpts): EndeavourRunnable<R>
  /**
   * Wraps an asychronous function, allowing it to be retried upon failure.
   * @param operation The function to retry.
   * @param ctx The execution context used when running the operation.
   * @example
   * ```typescript
   * // person.speak() will be called with the context of person
   * const faultTolerantOperation = endeavour(person.speak, person)
   * ````
   */
  <R>(operation: Operation<R>, ctx: any): EndeavourRunnable<R>
  /**
   * Wraps an asychronous function, allowing it to be retried upon failure.
   * @param operation The function to retry.
   * @param opts Config options for how the function should be retried.
   * @param ctx The execution contexted used when running the operation.
   * @example
   * ```typescript
   * // try person.speak() 2 time, with the context of person
   * const faultTolerantOperation = endeavour(person.speak, { retries: 2 }, person)
   * ```
   */
  <R>(
    operation: Operation<R>,
    opts: EndeavourOpts,
    ctx: any
  ): EndeavourRunnable<R>
}
