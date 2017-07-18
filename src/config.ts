import BackoffFactory, { Backoff, BackoffOpts, isBackoffOpts } from './backoff'
import { EndeavourCallback } from './runnable'

export interface EndeavourOpts extends BackoffOpts {
  retries?: number
  forever?: boolean
}

/**
 * Typeguard for asseting some arg is of the EndeavourOpts
 * type
 */
function isEndeavourOpts(arg: any): arg is EndeavourOpts {
  return (
    typeof arg === 'object' &&
    (typeof arg.retries === 'number' ||
      typeof arg.forever === 'boolean' ||
      isBackoffOpts(arg))
  )
}

export function getEndeavourArgs(
  this: any,
  optsOrCtx: any = {},
  ctx?: any
): { operationCtx: any; opts: any; backoff: Backoff } {
  let opts: any = { retries: 10, forever: false }
  let operationCtx: any
  let backoff: Backoff

  if (isEndeavourOpts(optsOrCtx)) {
    opts = { ...opts, ...optsOrCtx }
    operationCtx = ctx
    // If no options are passed into endeavour() optsOrCtx is an empty
    // object. When this is the case the ctx is just set to "this" in endeavour
  } else if (optsOrCtx instanceof Object && Object.keys(optsOrCtx).length) {
    operationCtx = optsOrCtx
  }

  backoff = BackoffFactory(opts)

  return {
    opts,
    operationCtx,
    backoff
  }
}

export function getRunnableArgs(
  args: Array<any>
): { interceptArgs: Array<any>; intercept: Function | undefined } {
  let interceptArgs = []
  let intercept

  if (args[0] instanceof Array) {
    interceptArgs = args[0]
  } else if (typeof args[0] === 'function') {
    intercept = args[0]
  }
  if (typeof args[1] === 'function') {
    intercept = args[1]
  }

  return { interceptArgs, intercept }
}
