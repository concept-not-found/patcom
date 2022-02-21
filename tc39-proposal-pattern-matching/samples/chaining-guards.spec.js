import { jest } from '@jest/globals'

import ChainingGuards from './chaining-guards.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('chaining guards sample', () => {
    test('call console.log with multiple pages when pages is 2', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      ChainingGuards({ pages: 2, data: {} })
      expect(log).toHaveBeenNthCalledWith(1, 'multiple pages')
    })

    test('call console.log with one page when pages is 1', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      ChainingGuards({ pages: 1, data: {} })
      expect(log).toHaveBeenNthCalledWith(1, 'one page')
    })

    test('call console.log with no pages when pages is zero', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      ChainingGuards({ pages: 0, data: {} })
      expect(log).toHaveBeenNthCalledWith(1, 'no pages')
    })
  })
})
