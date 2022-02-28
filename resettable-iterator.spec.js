import ResettableIterator from './resettable-iterator.js'

describe('resettable iterator', () => {
  test('resettable iterator itself is iterable', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = ResettableIterator(numbers())
    expect(iterator[Symbol.iterator]).toBeDefined()
  })

  test('passthrough source', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = ResettableIterator(numbers())
    expect([...iterator]).toEqual([1, 2, 3])
  })

  test('can read for a second time after reset', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = ResettableIterator(numbers())
    expect([...iterator]).toEqual([1, 2, 3])
    iterator.reset()
    expect([...iterator]).toEqual([1, 2, 3])
  })

  test('resets to mark', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = ResettableIterator(numbers())
    expect(iterator.next().value).toBe(1)
    iterator.mark()
    expect([...iterator]).toEqual([2, 3])
    iterator.reset()
    expect([...iterator]).toEqual([2, 3])
  })

  test('can read fully after partial read', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = ResettableIterator(numbers())
    expect(iterator.next().value).toBe(1)
    iterator.reset()
    expect([...iterator]).toEqual([1, 2, 3])
  })

  test('consumes source lazily', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterable = numbers()
    const iterator = ResettableIterator(iterable)
    iterator.next().value
    expect([...iterable]).toEqual([2, 3])
  })
})
