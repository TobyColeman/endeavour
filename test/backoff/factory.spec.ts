import { expect } from 'chai'

import Backoff from '../../src/backoff'

describe('Backoff factory', () => {
  it('should export a function', () => {
    expect(Backoff).to.be.a('function')
  })

  it('should return exponential backoff by default', () => {
    const backoff = Backoff()

    expect(backoff(1)).to.equal(2000)
    expect(backoff(2)).to.equal(4000)
    expect(backoff(3)).to.equal(8000)
  })

  it('should return linear backoff', () => {
    const backoff = Backoff({ type: 'linear' })

    expect(backoff(1)).to.equal(2000)
    expect(backoff(2)).to.equal(4000)
    expect(backoff(3)).to.equal(6000)
  })

  it('should return exponential backoff', () => {
    const backoff = Backoff({ type: 'exponential' })

    expect(backoff(1)).to.equal(2000)
    expect(backoff(2)).to.equal(4000)
    expect(backoff(3)).to.equal(8000)
  })
})
