import { expectMatched } from './test-utils'

import { matchRegExp } from '.'

describe('matchRegExp', () => {
  test('matched exact RegExp', () => {
    const matcher = matchRegExp(/^Alice$/)
    const result = matcher('Alice')
    expectMatched(result)
    expect(result.value).toBe('Alice')
  })

  test('unmatched to unmatched RegExp', () => {
    const matcher = matchRegExp(/^Alice$/)
    const result = matcher('Bob')
    expect(result.matched).toBe(false)
  })
})
