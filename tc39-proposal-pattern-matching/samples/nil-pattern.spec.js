import { jest } from '@jest/globals'

import NilPattern from './nil-pattern.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('nil-pattern sample', () => {
    test('call console.log 3rd value with two holes before it', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      NilPattern([, , 'some value'])
      expect(log).toHaveBeenNthCalledWith(1, 'some value')
    })

    test('call console.log 3rd value with filled holes', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      NilPattern(['filled', 'filled', 'some value'])
      expect(log).toHaveBeenNthCalledWith(1, 'some value')
    })

    test('does nothing with 3 holes', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      NilPattern([, ,])
      expect(log).not.toHaveBeenCalled()
    })
  })
})
