import { expectMatched, expectUnmatched } from './test-utils.js'

import { matchObject, defined, rest } from './index.js'

describe('matchObject', () => {
  test('empty expected matches any object', () => {
    const matcher = matchObject()
    const result = matcher({ x: 1, y: 2, z: 3 })
    expectMatched(result)
    expect(result.value).toEqual({
      x: 1,
      y: 2,
      z: 3,
    })
  })

  test('matched identical literal object', () => {
    const matcher = matchObject({ x: 1, y: 2, z: 3 })
    const result = matcher({ x: 1, y: 2, z: 3 })
    expectMatched(result)
    expect(result.value).toEqual({
      x: 1,
      y: 2,
      z: 3,
    })
  })

  test('empty expected does not match undefined', () => {
    const matcher = matchObject()
    const result = matcher()
    expectUnmatched(result)
  })

  test('access nested matched result fields', () => {
    const matcher = matchObject({ x: /^hello (?<id>\d+)$/ })
    const result = matcher({ x: 'hello 42' })
    expectMatched(result)
    const {
      result: {
        x: {
          matchedRegExp: {
            groups: { id },
          },
        },
      },
    } = result
    expect(id).toBe('42')
  })

  test('unmatched empty object with expected field', () => {
    const matcher = matchObject({ x: defined })
    const result = matcher({})
    expectUnmatched(result)
  })

  test('rest matcher collect remaining fields', () => {
    const matcher = matchObject({ x: 1, rest })
    const result = matcher({ x: 1, y: 2, z: 3 })
    expectMatched(result)
    expect(result.value).toEqual({
      x: 1,
      y: 2,
      z: 3,
    })
    expect(result.result.rest.value).toEqual({
      y: 2,
      z: 3,
    })
  })

  test('rest matcher collect remaining fields even if already complete match', () => {
    const matcher = matchObject({ x: 1, y: 2, z: 3, rest })
    const result = matcher({ x: 1, y: 2, z: 3 })
    expectMatched(result)
    expect(result.value).toEqual({
      x: 1,
      y: 2,
      z: 3,
    })
    expect(result.result.rest.value).toEqual({})
  })
})
