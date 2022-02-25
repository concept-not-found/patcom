import { expectMatched } from './test-utils.js'

import { matchArray, rest } from './index.js'

describe('matchArray', () => {
  test('empty expected matches any array', () => {
    const matcher = matchArray()
    const result = matcher([1, 2, 3])
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('empty expected does not match undefined', () => {
    const matcher = matchArray()
    const result = matcher()
    expect(result.matched).toBe(false)
  })

  test('matched identical literal array', () => {
    const matcher = matchArray([1, 2, 3])
    const result = matcher([1, 2, 3])
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('holes in expected are any', () => {
    const matcher = matchArray([1, , 3])
    const result = matcher([1, 2, 3])
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('holes in value match undefined', () => {
    const matcher = matchArray([1, undefined, 3])
    const result = matcher([1, , 3])
    expectMatched(result)
    expect(result.value).toEqual([1, undefined, 3])
  })

  test('unmatched when expected more elements', () => {
    const matcher = matchArray([1, 2, 3])
    const result = matcher([1, 2])
    expect(result.matched).toBe(false)
  })

  test('unmatched when more elements than expected', () => {
    const matcher = matchArray([1, 2, 3])
    const result = matcher([1, 2, 3, 4])
    expect(result.matched).toBe(false)
  })

  test('rest matches remaining element', () => {
    const matcher = matchArray([1, rest])
    const result = matcher([1, 2, 3])
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
    expect(result.rest).toEqual([2, 3])
  })

  test('rest matches remaining element even if already complete match', () => {
    const matcher = matchArray([1, 2, 3, rest])
    const result = matcher([1, 2, 3])
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
    expect(result.rest).toEqual([])
  })

  test('empty expected matches any iterator', () => {
    const matcher = matchArray()
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }
    const result = matcher(numbers())
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('matched iterator with same elements', () => {
    const matcher = matchArray([1, 2, 3])
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }
    const result = matcher(numbers())
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('rest matches remaining iterator', () => {
    const matcher = matchArray([1, rest])
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }
    const result = matcher(numbers())
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('rest matches remaining iterator even if already complete match', () => {
    const matcher = matchArray([1, 2, 3, rest])
    function* numbers() {
      yield 1
      yield 2
      yield 3
    }
    const result = matcher(numbers())
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
  })

  test('unmatched iterator when expected more elements', () => {
    const matcher = matchArray([1, 2, 3])
    function* numbers() {
      yield 1
      yield 2
    }
    const result = matcher(numbers())
    expect(result.matched).toBe(false)
  })

  test('unmatched iterator when more elements than expected', () => {
    const matcher = matchArray([1, 2, 3])
    function* numbers() {
      yield 1
      yield 2
      yield 3
      yield 4
      yield 5
    }
    const result = matcher(numbers())
    expect(result.matched).toBe(false)
  })

  test('only reads iterator one passed number of expected elements', () => {
    const matcher = matchArray([1, 2, 3])
    function* numbers() {
      yield 1
      yield 2
      yield 3
      yield 4
      yield 5
      yield 6
    }
    const iterable = numbers()
    matcher(iterable)
    expect([...iterable]).toEqual([5, 6])
  })
})
