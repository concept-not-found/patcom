import { jest } from '@jest/globals'

import AsciiCi from './ascii-ci.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('ascii ci sample', () => {
    test('call console.log with value if name is color', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      const matcher = AsciiCi
      matcher({
        name: 'color',
        value: 'red',
      })
      expect(log).toHaveBeenNthCalledWith(1, 'color: red')
    })

    test('call console.log with value if name is COLOR', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      const matcher = AsciiCi
      matcher({
        name: 'COLOR',
        value: 'red',
      })
      expect(log).toHaveBeenNthCalledWith(1, 'color: red')
    })

    test('does nothing if name is font', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      const matcher = AsciiCi
      matcher({
        name: 'font',
        value: 'fira code',
      })
      expect(log).not.toHaveBeenCalled()
    })
  })
})
