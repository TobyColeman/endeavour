export interface Backoff {
  (attempt: number): number
}

export interface Sleep {
  (delay: number): Promise<number>
}

/**
 * Options for configuring a backoff strategy
 */
export interface BackoffOpts {
  /**
   * The type of backoff strategy to use
   */
  type?: 'exponential' | 'linear'
  /**
   * The number of milliseconds before starting the first retry.
   */
  minTimeout?: number
  /**
   * The maximum number of milliseconds between two retries.
   */
  maxTimeout?: number
  /**
   * Some constant that affects the rate of change in a
   * backoff strategy.
   */
  constant?: number
}

/**
 * Type guard for asseting some arg is of the BackoffOpts
 * type
 */
export function isBackoffOpts(arg: any): arg is BackoffOpts {
  return (
    arg.type === 'exponential' ||
    arg.type === 'linear' ||
    typeof arg.minTimeout === 'number' ||
    typeof arg.maxTimeout === 'number' ||
    typeof arg.constant === 'number'
  )
}
