import { expectMatched } from './test-utils.js'

import { matchObject, rest } from './index.js'

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
