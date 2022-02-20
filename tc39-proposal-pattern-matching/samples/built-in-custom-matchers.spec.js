import { jest } from '@jest/globals'

import BuiltInCustomMatchers from './built-in-custom-matchers.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('built-in custom matchers sample', () => {
    test.each([
      {
        type: 'Number',
        value: 42,
      },
      {
        type: 'BigInt',
        value: BigInt(42),
      },
      {
        type: 'String',
        value: '42',
      },
      {
        type: 'Array',
        value: [42],
      },
      {
        type: 'otherwise',
        value: false,
      },
    ])('call console.log with $type $value', ({ type, value }) => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      const matcher = BuiltInCustomMatchers
      matcher(value)
      expect(log).toHaveBeenNthCalledWith(1, type, value)
    })
  })
})
