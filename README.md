# endeavour
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
    result = faultTolerant()
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

### EndeavourRunnable([arguments], [intercept])
Using your wrapped function from `endeavour(...)` works much in the same way as before. Arguments are be passed like this:

```typescript
myFaultTolerantOperation(['some', 'arguments'])
```

The wrapped operation also accepts and optional function to allow for greater control over how retries should proceed.

```typescript
faultTolerantOperation((result, next) => {
  if (result.error instanceof MyCustomError) {
    return nex(new Error('something went horribly wrong :('))
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

  // retries 10 times
  @endeavourify()
  otherThing() { }
}
``` 

When no arguments are given to `@endeavourable` or `@endeavourify`, the defaults provided [here](#endeavourthenablefunction-options-ctx) will be used.