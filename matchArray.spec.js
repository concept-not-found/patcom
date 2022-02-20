import { expectMatched } from './test-utils.js'

import { matchArray, rest } from './index.js'

describe('matchArray', () => {
  test('matched identical literal array', () => {
    const matcher = matchArray([1, 2, 3])
    const result = matcher([1, 2, 3])
    expectMatched(result)
    expect(result.value).toEqual([1, 2, 3])
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
  })
})
