import { expect } from 'chai'

import endeavour from '../src'

describe('endeavour', () => {
  function getUnreliableOperation(totalFailures: number) {
    let failures = 1

    return (...args: Array<any>) => {
      if (failures >= totalFailures) {
        return Promise.resolve(args.length ? args : failures)
      }
      failures += 1
      return Promise.reject(new Error('failed'))
    }
  }

  function getFailingOperation() {
    return () => {
      return Promise.reject(new Error('failed'))
    }
  }

  it('should export a function', () => {
    expect(endeavour).to.be.a('function')
  })

  it('should retry an operation if it fails', async () => {
    const unreliable = getUnreliableOperation(2)
    const faultTolerant = endeavour(unreliable, {
      minTimeout: 10,
      maxTimeout: 50
    })

    const attempts = await faultTolerant()

    expect(attempts).to.equal(2)
  })

  it('should throw an error if an operation fails after X attempts', async () => {
    const faultTolerant = endeavour(getFailingOperation(), {
      retries: 2,
      minTimeout: 10,
      maxTimeout: 50
    })

    try {
      await faultTolerant()
    } catch (error) {
      expect(error.message).to.equal(
        'Failed to execute operation after 2 attempts'
      )
    }
  })

  it('should run the wrapped function in the passed in context', async () => {
    const thing = {
      name: 'targaryen',
      doSomething() {
        return Promise.resolve(this.name)
      }
    }
    const faultTolerant = endeavour(thing.doSomething, thing)
    const result = await faultTolerant()

    expect(result).to.equal('targaryen')
  })

  it('should run the wrapped function with some arguments', async () => {
    function resolveString(arg: string) {
      return Promise.resolve(arg)
    }

    const faultTolerant = endeavour(resolveString)
    const result = await faultTolerant(['lannister'])

    expect(result).to.equal('lannister')
  })

  describe('when using an intercept', () => {
    it('should reveal information about the current operation', async () => {
      const faultTolerant = endeavour(getUnreliableOperation(2), {
        retries: 2,
        minTimeout: 10,
        maxTimeout: 50
      })

      await faultTolerant(result => {
        expect(result.error.message).to.equal('failed')
        expect(result.attempt).to.equal(1)
        expect(result.nextDelay).to.equal(20)
      })
    })

    it('should stop if an error is passed to Next()', async () => {
      const faultTolerant = endeavour(getUnreliableOperation(2), {
        retries: 2,
        minTimeout: 10,
        maxTimeout: 50
      })

      try {
        await faultTolerant((result, next) => {
          return next(new Error('stopped'))
        })
      } catch (error) {
        expect(error.message).to.equal('stopped')
      }
    })

    it('should call the operation with updated arguments', async () => {
      const faultTolerant = endeavour(getUnreliableOperation(2), {
        retries: 2,
        minTimeout: 10,
        maxTimeout: 50
      })

      const result = await faultTolerant((result, next) => {
        return next(['dank'])
      })

      expect(result).to.deep.equal(['dank'])
    })
  })

  // it('should run forever', () => {

  // })
})
