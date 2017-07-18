import { expect } from 'chai'

import { endeavourify, endeavourable } from '../src'

describe('endeavourable', () => {
  @endeavourable({ retries: 4 })
  class Thing {
    attempts: number
    aProp: string
    failures: number

    constructor(aProp: string, attempts: number) {
      this.attempts = attempts
      this.aProp = aProp
      this.failures = 0
    }

    @endeavourify({ minTimeout: 10, maxTimeout: 11 })
    doSomething() {
      if (this.failures >= this.attempts) {
        return Promise.resolve(this.aProp)
      }
      this.failures += 1

      return Promise.reject(new Error('failed'))
    }

    @endeavourify({ minTimeout: 10, maxTimeout: 11 })
    doSomethingRight() {
      return Promise.resolve(this.aProp)
    }

    @endeavourify({ minTimeout: 10, maxTimeout: 11 })
    failAtSomething() {
      this.failures += 1
      return Promise.reject(new Error('failed'))
    }
  }

  describe('@endeavourify', () => {
    it('should export a function', () => {
      expect(endeavourify).to.be.a('function')
    })

    it('should wrap an unreliable class method', async () => {
      const instance = new Thing('lannister', 2)
      const result = await instance.doSomething()

      expect(result).to.equal('lannister')
      expect(instance.failures).to.equal(2)
    })

    it('should resolve immediately for a successful operation', async () => {
      const instance = new Thing('lannister', 2)
      const result = await instance.doSomething()

      expect(result).to.equal('lannister')
    })
  })

  describe('@endeavourable', () => {
    it('should export a function', () => {
      expect(endeavourable).to.be.a('function')
    })

    it('should use the metadata provided', async () => {
      let instance = new Thing('lannister', 50)

      try {
        await instance.failAtSomething()
      } catch (error) {
        expect(instance.failures).to.equal(4)
        expect(error.message).to.equal(
          'Failed to execute operation after 4 attempts'
        )
      }
    })
  })
})
