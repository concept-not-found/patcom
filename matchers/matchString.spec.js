import { expectMatched, expectUnmatched } from './test-utils.js'

import { matchString } from './index.js'

describe('matchString', () => {
  test('matched exact string', () => {
    const matcher = matchString('Alice')
    const result = matcher('Alice')
    expectMatched(result)
    expect(result.value).toBe('Alice')
  })

  test('matched when value is new String', () => {
    const matcher = matchString('Alice')
    const value = new String('Alice')
    const result = matcher(value)
    expectMatched(result)
    expect(result.value).toBe(value)
  })

  test('matched expected is new String', () => {
    const matcher = matchString(new String('Alice'))
    const result = matcher('Alice')
    expectMatched(result)
    expect(result.value).toBe('Alice')
  })

  test('unmatched to different string', () => {
    const matcher = matchString('Ailce')
    const result = matcher('Bob')
    expectUnmatched(result)
  })
})
