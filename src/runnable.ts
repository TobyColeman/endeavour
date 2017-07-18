/**
 * Optional callback passed to an Endeavour runnable
 */
export interface EndeavourCallback {
  (
    result: {
      /** The most recently returned error */
      error: any
      /** The number of times an operation has been tried */
      attempt: number
      /** The amount of time(ms) until the next retry */
      nextDelay: number
    },
    next: Next
  ): Promise<Array<any>> | void
}

export interface Next {
  /**
   * Passing an error will stop the execution of an operation.
   * To retry to operation with different arguments, pass next()
   * an array.
   */
  (arg: Error | Array<any>): Promise<Array<any>>
}

export interface EndeavourRunnable<R> {
  /**
   * The wrapped operation
   * @type {function}
   * @example
   * ```typescript
   * // Basic usage.
   * async function main() {
   *  try {
   *    const result = await faultTolerantOperation()
   *  } catch(e) {
   *    // handle failed operation
   *  }
   * }
   * ```
   */
  (): Promise<R>
  /**
   * Optional intercept for inspecting an operation's
   * failed attempts.
   * @example
   * ```typescript
   * async function main() {
   *  try {
   *    const result = await faultTolerantOperation((result, stop) => {
   *      if (result.error.message === 'ERR_TIMEOUT') {
   *        return stop('my custom error')
   *      }
   *    })
   *  } catch(e) {
   *    // error caught here will be the one passed
   *    // to stop, or a timeout error
   *  }
   * }
   * ```
   */
  (intercept: EndeavourCallback): Promise<R>
  /**
   * The wrapped operation
   * @param args argumnents passed to the wrapped function
   * @example
   * ```typescript
   * // Basic usage.
   * async function main() {
   *  try {
   *    const result = await faultTolerantOperation([arg1, arg2, arg3])
   *  } catch(e) {
   *    // handle failed operation
   *  }
   * }
   * ```
   */
  (args: Array<any>): Promise<R>
  /**
   * The wrapped operation
   * @param args arguments passed to the wrapped function
   * @param intercept callback that can be used to inspect
   * an operation's failed attepts
   * @example
   * ```typescript
   * async function main() {
   *  try {
   *    const result = await faultTolerantOperation([arg1], (result, stop) => {
   *      if (result.error.message === 'ERR_TIMEOUT') {
   *        return stop('my custom error')
   *      }
   *    })
   *  } catch(e) {
   *    // error caught here will be the one passed
   *    // to stop, or a timeout error
   *  }
   * }
   * ```
   */
  (args: Array<any>, intercept: EndeavourCallback): Promise<R>
}
