import { jest } from '@jest/globals'

import ArrayPatternCaching from './array-pattern-caching.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('array pattern caching sample', () => {
    test('logs found one when given one integer', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      ArrayPatternCaching(1)
      expect(log).toHaveBeenNthCalledWith(1, 'found one int: 1')
      expect(log).toHaveBeenNthCalledWith(2, [])
    })

    test('logs found two when given two integers', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      ArrayPatternCaching(2)
      expect(log).toHaveBeenNthCalledWith(1, 'found two ints: 1 and 2')
      expect(log).toHaveBeenNthCalledWith(2, [])
    })

    test('logs otherwise case and 4, 5 when given 5 integers', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      ArrayPatternCaching(5)
      expect(log).toHaveBeenNthCalledWith(1, 'more than two ints')
      expect(log).toHaveBeenNthCalledWith(2, [4, 5])
    })
  })
})
