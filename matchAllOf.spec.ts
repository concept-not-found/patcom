import { expectMatched } from './test-utils'

import { allOf, matchProp } from '.'

describe('allOf', () => {
  test('matched both RegExp', () => {
    const matcher = allOf(/hello/, /world/)
    const result = matcher('hello world')
    expectMatched(result)
    expect(result.value).toEqual('hello world')
  })

  test('matched string with prop', () => {
    const matcher = allOf(/Eve/, matchProp('evil'))
    type EvilString = string & { evil: boolean }
    const input: Partial<EvilString> = new String('Eve')
    input.evil = true
    const result = matcher(input)
    expectMatched(result)
    expect(result.value).toEqual(input)
  })

  test('unmatched when one RegExp is unmatched', () => {
    const matcher = allOf(/hello/, /world/)
    const result = matcher('hello bob')
    expect(result.matched).toBe(false)
  })
})
