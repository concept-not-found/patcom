import { jest } from '@jest/globals'

import { expectMatched } from './test-utils.js'

describe('test utils', () => {
  describe('expectedMatch', () => {
    test('does nothing for matched result', () => {
      const result = {
        matched: true,
      }
      expectMatched(result)
    })

    test('console.dir and throws on unmatched result', () => {
      const result = {
        matched: false,
        someContext: 'some context value',
      }
      const dir = jest.spyOn(global.console, 'dir').mockImplementation()
      expect(() => expectMatched(result)).toThrow()
      expect(dir).toHaveBeenNthCalledWith(1, result)
    })
  })
})
