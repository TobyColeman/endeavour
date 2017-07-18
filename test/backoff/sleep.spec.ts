import { expect } from 'chai'

import { sleep } from '../../src/backoff'

describe('sleep', () => {
  it('should export a function', () => {
    expect(sleep).to.be.a('function')
  })

  it('should resolve after 5ms', () => {
    return sleep(5).then(delay => {
      expect(delay).to.equal(5)
    })
  })
})
