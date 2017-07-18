import { Backoff, BackoffOpts } from './strategy'
import exponential from './exponential'
import linear from './linear'

/**
 * Factory for creating different back off strategies
 */
export default function backoffFactory(
  {
    type = 'exponential',
    minTimeout = 1000,
    maxTimeout = Infinity,
    constant = 2
  }: BackoffOpts = {}
): Backoff {
  let backoff: Backoff

  switch (type) {
    case 'exponential':
      backoff = exponential(constant)
      break
    case 'linear':
      backoff = linear(constant)
      break
    default:
      backoff = exponential(constant)
  }

  return (step: number) => {
    return Math.min(maxTimeout, backoff(step) * minTimeout)
  }
}

/**
 * non-blocking sleep
 * @param delay the amount of time to wait before resolving
 */
export function sleep(delay: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(delay), delay)
  })
}

export { Backoff, BackoffOpts, isBackoffOpts } from './strategy'
