import { jest } from '@jest/globals'

import { ObjectPatternCaching } from './sample.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('object pattern caching sample', () => {
    test('matches number with single read to Math.random less than half', () => {
      const log = jest.spyOn(global.console, 'log').mockReturnValue()
      const random = jest.spyOn(global.Math, 'random').mockReturnValue(0.2)
      ObjectPatternCaching()
      expect(log).toHaveBeenNthCalledWith(1, 'Only matches half the time.')
      expect(random).toHaveBeenCalledTimes(1)
    })

    test('matches string with single read to Math.random greater than half', () => {
      const log = jest.spyOn(global.console, 'log').mockReturnValue()
      const random = jest.spyOn(global.Math, 'random').mockReturnValue(0.8)
      ObjectPatternCaching()
      expect(log).toHaveBeenNthCalledWith(
        1,
        'Guaranteed to match the other half of the time.'
      )
      expect(random).toHaveBeenCalledTimes(1)
    })
  })
})
