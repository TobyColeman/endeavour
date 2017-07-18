import { Backoff } from './strategy'

/**
 * Linear backoff
 */
export default (slope: number): Backoff => (attempt: number) => slope * attempt
