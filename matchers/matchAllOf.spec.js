import { expectMatched, expectUnmatched } from './test-utils.js'

import { allOf, matchProp } from '../index.js'

describe('allOf', () => {
  test('matches any if no expected matchers', () => {
    const matcher = allOf()
    const result = matcher(undefined)
    expectMatched(result)
    expect(result.value).toEqual(undefined)
  })

  test('matched both RegExp', () => {
    const matcher = allOf(/hello/, /world/)
    const result = matcher('hello world')
    expectMatched(result)
    expect(result.value).toEqual('hello world')
  })

  test('matched string with prop', () => {
    const matcher = allOf(/Eve/, matchProp('evil'))
    const input = new String('Eve')
    input.evil = true
    const result = matcher(input)
    expectMatched(result)
    expect(result.value).toEqual(input)
  })

  test('access nested matched result fields', () => {
    const matcher = allOf(/^(?<greeting>hello|hi)/, /(?<id>\d+)$/)
    const result = matcher('hello 42')
    expectMatched(result)
    const {
      result: [
        {
          matchedRegExp: {
            groups: { greeting },
          },
        },
        {
          matchedRegExp: {
            groups: { id },
          },
        },
      ],
    } = result
    expect(greeting).toBe('hello')
    expect(id).toBe('42')
  })

  test('unmatched when one RegExp is unmatched', () => {
    const matcher = allOf(/hello/, /world/)
    const result = matcher('hello bob')
    expectUnmatched(result)
  })
})
