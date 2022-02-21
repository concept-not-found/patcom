import { jest } from '@jest/globals'

import { WithChainingRegExp } from './sample.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('with chaining regexp sample', () => {
    test('call console.log with suffix after foo', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      WithChainingRegExp()
      expect(log).toHaveBeenNthCalledWith(1, 'bar')
    })
  })
})
