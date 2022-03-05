import { expectMatched, expectUnmatched } from './test-utils.js'

import { matchArray, oneOf, group } from '../index.js'

describe('oneOf', () => {
  test('unmatched  if no expected matchers', () => {
    const matcher = oneOf()
    expectUnmatched(matcher(undefined))
    expectUnmatched(matcher('alice'))
  })

  test('one of group', () => {
    const matcher = matchArray([
      oneOf(group('alice', 'bob'), group('fred', 'sally')),
    ])
    expectMatched(matcher(['alice', 'bob']))
    expectMatched(matcher(['fred', 'sally']))

    expectUnmatched(matcher([]))
    expectUnmatched(matcher(['alice']))
    expectUnmatched(matcher(['bob']))
    expectUnmatched(matcher(['fred']))
    expectUnmatched(matcher(['sally']))
    expectUnmatched(matcher(['alice', 'sally']))
    expectUnmatched(matcher(['fred', 'bob']))
  })
})
