import { expect } from 'chai'

import Backoff from '../../src/backoff/linear'

describe('Linear backoff', () => {
  it('should export a function', () => {
    expect(Backoff).to.be.a('function')
  })

  it('should return a function', () => {
    expect(Backoff(2)).to.be.a('function')
  })

  it('should return the correct sequence', () => {
    const exp = Backoff(2)
    const input = [1, 2, 3, 4]
    const expected = [2, 4, 6, 8]
    let actual = []

    for (var i = 0; i < input.length; i++) {
      actual[i] = exp(i + 1)
    }

    expect(actual).to.deep.equal(expected)
  })
})
