import { expectMatched } from './test-utils.js'

import { matchObject, defined, rest } from './index.js'

describe('matchObject', () => {
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

  test('unmatched empty object with expected field', () => {
    const matcher = matchObject({ x: defined })
    const result = matcher({})
    expect(result.matched).toBe(false)
  })

  test('rest matcher collect remaining fields', () => {
    const matcher = matchObject({ x: 1, rest })
    const result = matcher({ x: 1, y: 2, z: 3 })
    expectMatched(result)
    expect(result.value).toEqual({
      x: 1,
      rest: {
        y: 2,
        z: 3,
      },
    })
  })
})
