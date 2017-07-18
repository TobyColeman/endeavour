import { Backoff } from './strategy'

/**
 * Exponential backoff
 */
export default (constant: number): Backoff => (attempt: number) =>
  Math.pow(constant, attempt)
