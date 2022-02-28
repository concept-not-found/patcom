import TimeJumpIterator from './time-jump-iterator.js'

describe('time jump iterator', () => {
  test('time jump itself is iterable', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = TimeJumpIterator(numbers())
    expect(iterator[Symbol.iterator]).toBeDefined()
  })

  test('passthrough source', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = TimeJumpIterator(numbers())
    expect([...iterator]).toEqual([1, 2, 3])
  })

  test('can read for a second time after jump back to beginning', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = TimeJumpIterator(numbers())
    expect([...iterator]).toEqual([1, 2, 3])
    iterator.jump()
    expect([...iterator]).toEqual([1, 2, 3])
  })

  test('can tell how much time has passed', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = TimeJumpIterator(numbers())
    const start = iterator.now
    iterator.next()
    iterator.next()
    const end = iterator.now
    expect(end - start).toEqual(2)
  })

  test('jumps to time', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = TimeJumpIterator(numbers())
    iterator.next()
    const time = iterator.now
    expect([...iterator]).toEqual([2, 3])
    iterator.jump(time)
    expect([...iterator]).toEqual([2, 3])
  })

  test('can read fully after partial read', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterator = TimeJumpIterator(numbers())
    iterator.next()
    iterator.jump()
    expect([...iterator]).toEqual([1, 2, 3])
  })

  test('consumes source lazily', () => {
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }

    const iterable = numbers()
    const iterator = TimeJumpIterator(iterable)
    iterator.next()
    expect([...iterable]).toEqual([2, 3])
  })
})
