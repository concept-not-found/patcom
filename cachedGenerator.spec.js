import { cachedGenerator } from './index.js'

describe('cachedGenerator', () => {
  test('cached generator itself is a generator', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const reset = cachedGenerator(numbers())
    expect(reset()[Symbol.iterator]).toBeDefined()
  })

  test('passthrough source', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const reset = cachedGenerator(numbers())
    expect([...reset()]).toEqual([1, 2, 3])
  })

  test('can read for a second time after reset', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const reset = cachedGenerator(numbers())
    expect([...reset()]).toEqual([1, 2, 3])
    expect([...reset()]).toEqual([1, 2, 3])
  })

  test('can read fully after partial read', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const reset = cachedGenerator(numbers())
    expect(reset().next().value).toBe(1)
    expect([...reset()]).toEqual([1, 2, 3])
  })

  test('consumes source lazily', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterable = numbers()
    const reset = cachedGenerator(iterable)
    reset().next().value
    expect([...iterable]).toEqual([2, 3])
  })
})
