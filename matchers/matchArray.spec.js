import { expectMatched, expectUnmatched } from './test-utils.js'

import { matchArray, maybe, some, rest } from './index.js'

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
    expectUnmatched(result)
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
    expectUnmatched(result)
  })

  test('unmatched when more elements than expected', () => {
    const matcher = matchArray([1, 2, 3])
    const result = matcher([1, 2, 3, 4])
    expectUnmatched(result)
  })

  test('access nested matched result fields', () => {
    const matcher = matchArray([/^hello (?<id>\d+)$/])
    const result = matcher(['hello 42'])
    expectMatched(result)
    const {
      results: [
        {
          matchedRegExp: {
            groups: { id },
          },
        },
      ],
    } = result
    expect(id).toBe('42')
  })

  test('only contains nested matched result fields up to rest', () => {
    const matcher = matchArray([/^hello (?<id>\d+)$/, rest])
    const result = matcher(['hello 42', 69])
    expectMatched(result)
    expect(result.results.length).toBe(1)
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
    expectUnmatched(result)
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
    expectUnmatched(result)
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

  test('matched maybe of single element', () => {
    const matcher = matchArray([maybe(1)])
    expectMatched(matcher([1]))
    expectMatched(matcher([]))
  })

  test('matched maybe is present in result', () => {
    const matcher = matchArray([maybe(1)])
    const result = matcher([1])
    expectMatched(result)
    expect(result.results[0]).toEqual({
      matched: true,
      value: 1,
    })
  })

  test('matched maybe is present in result as undefined value when element is not present', () => {
    const matcher = matchArray([maybe(1)])
    const result = matcher([])
    expectMatched(result)
    expect(result.results[0]).toEqual({
      matched: true,
      value: undefined,
    })
  })

  test('matched maybe before other elements', () => {
    const matcher = matchArray([maybe(1), 2])
    expectMatched(matcher([1, 2]))
    expectMatched(matcher([2]))
  })

  test('matched maybe after other elements', () => {
    const matcher = matchArray([1, maybe(2)])
    expectMatched(matcher([1, 2]))
    expectMatched(matcher([1]))
  })

  test('matched some of matching elements', () => {
    const matcher = matchArray([some(1)])
    expectMatched(matcher([1]))
    expectMatched(matcher([1, 1]))
  })

  test('unmatched when no elements match some', () => {
    const matcher = matchArray([some(1)])
    expectUnmatched(matcher([]))
    expectUnmatched(matcher([2]))
  })

  test('unmatched extra elements after some', () => {
    const matcher = matchArray([some(1)])
    expectUnmatched(matcher([1, 2]))
  })

  test('matched some of matching elements before other elements', () => {
    const matcher = matchArray([some(1), 2])
    expectMatched(matcher([1, 2]))
    expectMatched(matcher([1, 1, 2]))
  })

  test('matched some of matching elements after other elements', () => {
    const matcher = matchArray([1, some(2)])
    expectMatched(matcher([1, 2]))
    expectMatched(matcher([1, 2, 2]))
  })
})
