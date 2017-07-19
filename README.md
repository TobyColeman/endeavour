# Endeavour
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Coverage Status](https://coveralls.io/repos/github/TobyColeman/endeavour/badge.svg?branch=master)](https://coveralls.io/github/TobyColeman/endeavour?branch=master)
[![CircleCI](https://circleci.com/gh/TobyColeman/endeavour.svg?style=svg)](https://circleci.com/gh/TobyColeman/endeavour)

Flexible, fault-tolerant operations for Typescript.

## Requirements
- Node `>=4.6.0`
- Typescript `>=2.0`
- Experimental decorators
- ES6 target (for async/await support)

## Installation
```npm install node-endeavour --save```

## Example Usage

```typescript
import endeavour from 'node-endeavour'

function unreliable () {
  if (Math.random <= 0.25) return Promise.resolve()
  return Promise.reject()
}

// create a fault tolerant operation. This will be retried
// 10 times, backing off exponentially with no maximum delay.
const faultTolerant = endeavour(unreliable)

async function main () {
  let result

  try {
    result = await faultTolerant()
  } catch (error) {
    console.log(error)
  }
}

main()
```

## API

### endeavour(thenableFunction, [options], [ctx])
Creates a new `EndeavourRunnable`; a wrapped version of your function that will retry indefinitely, or up until some specified limit. The default options are as follows:

- `retries` The maximum amount of times to retry the operation. Defaults to `10`.
- `constant` The base in exponential backoff, or the slope in linear backoff. Defaults to `2`.
- `minTimeout` The number of milliseconds before starting the first retry. Default is `1000`.
- `maxTimeout` The maximum number of milliseconds between two retries. Default is `Infinity`. 

You may also specify `this` (useful for wrapping instance methods).

```typescript
class Thing {
  doSomethingUnreliable () {}
}

const instance = new Thing()

const faultTolerant = endeavour(instance.doSomethingUnreliable, instance)

faultTolerant()
  .then(res => { console.log('yay!') })
  .catch(e => { console.log(':(')) })
```

See the [decorators](#decorators) section for a more terse way of handling these cases.

### EndeavourRunnable([arguments], [intercept])
Using your wrapped function from `endeavour(...)` works much in the same way as before. Arguments are be passed like this:

```typescript
myFaultTolerantOperation(['some', 'arguments'])
```

The wrapped operation also accepts and optional function to allow for greater control over how retries should proceed.

```typescript
faultTolerantOperation((result, next) => {
  if (result.error instanceof MyCustomError) {
    return next(new Error('something went horribly wrong :('))
  }
})
```

Calling `next()` with an error will stop your operation. You can also pass in an new array of arguments for subsequent retries.

```typescript
faultTolerantOperation((result, next) => {
  if (result.error instanceof MyCustomError) {
    return next(['new', 'args'])
  }
})
```

You could also just inspect the result of the last attempt.
```typescript
faultTolerantOperation(result => {
  console.log(result.error)
})
```

### Decorators

#### @endeavourable(EndeavourOpts)
A decorator for providing metadata about how retriable methods in a class should operate. Takes the options defined [here](#endeavourthenablefunction-options-ctx). 

#### @endeavourify([EndeavourOpts])
Provides the same functionality as [endeavour](#endeavourthenablefunction-options-ctx), but for class methods.

```typescript
@endeavourable({ retries: 15 })
class {
  // retried 15 times
  @endeavourify()
  unreliableMethod () {
    if (Math.random <= 0.25) return Promise.resolve()
    return Promise.reject()
  }

  // retried 5 times
  @endeavourify({ retries: 5 })
  doSomething () { }

  // retried 10 times
  @endeavourify()
  otherThing() { }
}
``` 

When no arguments are given to `@endeavourable` or `@endeavourify`, the defaults provided [here](#endeavourthenablefunction-options-ctx) will be used.

Want something for plain old JS? Check out [node-retry](https://github.com/tim-kos/node-retry).