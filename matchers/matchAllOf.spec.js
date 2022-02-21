import { expectMatched } from './test-utils.js'

import { allOf, matchProp } from '../index.js'

describe('allOf', () => {
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

  test('unmatched when one RegExp is unmatched', () => {
    const matcher = allOf(/hello/, /world/)
    const result = matcher('hello bob')
    expect(result.matched).toBe(false)
  })
})
