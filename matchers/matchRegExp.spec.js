import { expectMatched, expectUnmatched } from './test-utils.js'

import { matchRegExp } from './index.js'

describe('matchRegExp', () => {
  test('matched exact RegExp', () => {
    const matcher = matchRegExp(/^Alice$/)
    const result = matcher('Alice')
    expectMatched(result)
    expect(result.value).toBe('Alice')
  })

  test('matchedRegExp on matched result has named groups', () => {
    const matcher = matchRegExp(/^(?<greeting>.+) (?<name>.+)$/)
    const result = matcher('Hello Alice')
    expectMatched(result)
    const {
      matchedRegExp: { groups },
    } = result
    expect(groups).toEqual({
      greeting: 'Hello',
      name: 'Alice',
    })
  })

  test('matchedRegExp on matched result', () => {
    const matcher = matchRegExp(/^(.+) (.+)$/)
    const result = matcher('Hello Alice')
    expectMatched(result)
    const {
      matchedRegExp: [, greeting, name],
    } = result
    expect({ greeting, name }).toEqual({ greeting: 'Hello', name: 'Alice' })
  })

  test('unmatched to unmatched RegExp', () => {
    const matcher = matchRegExp(/^Alice$/)
    const result = matcher('Bob')
    expectUnmatched(result)
  })
})
